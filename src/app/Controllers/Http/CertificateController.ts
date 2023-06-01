import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Certificate from 'App/Models/Certificate'
import archiver from 'archiver'

export default class CertificateController {

    public async index({ workspaceId, request, sentryTrx }: HttpContextContract) {

        const span = sentryTrx.startChild({
            op: 'query',
            description: "certificate.index"
        })
        const page = request.input('page', 1)
        const domainName = request.input('domain')
        const perPage = 12
        const list = await Certificate.query().where(query => {
            query.where({
                workspaceId
            })
            if (domainName) {
                query.whereILike('domains', `%${domainName}%`)
            }

        })
        .orderBy('id', 'desc')
        .preload('order')
        .paginate(page, perPage)

        await Promise.all(list.map(item => item.order.load('dnsProviderCredential')))
        await Promise.all(list.map(item => item.order.load('authority')))
        await Promise.all(list.map(item => item.order.dnsProviderCredential.load('provider')))
        span.finish()
        return list.toJSON()
    }

    public async download({ params, workspaceId, response }: HttpContextContract) {
        // check
        const cert = await Certificate.findOrFail(params['id'])
        if (cert.workspaceId !== workspaceId) {
            throw new Exception('Unauthorized resource', 401)
        }

        const packet = archiver('zip', {
            zlib: {
                level: 2
            }
        })
        const domain = cert.domains[0].replace('*.', '')
        packet.append(cert.crt, { name: `${domain}.crt` })
        packet.append(cert.privateKey, { name: `${domain}.key` })
        response.header('content-type', 'application/octet-stream; ')
        response.header('content-disposition', `attachment; filename="${domain}.zip"`)
        response.stream(packet)
        await packet.finalize()
    }
}
