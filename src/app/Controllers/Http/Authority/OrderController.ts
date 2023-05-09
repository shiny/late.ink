import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CertificateOrder from 'App/Models/CertificateOrder'
import CertificateOrderValidator from 'App/Validators/CertificateOrderValidator'
import { attachAction } from 'App/Utils/CertificateAction'
import HttpNotFoundException from 'App/Exceptions/HttpNotFoundException'

export default class OrderController {
    async show({ workspaceId, params }: HttpContextContract) {
        const order = await CertificateOrder.query().where({
            workspaceId,
            id: params['id'],
            authorityId: params['authorityId']
        }).first()
        if (order) {
            await Promise.all([
                order.load('authority'),
                order.load('authorityAccount'),
                order.load('authorizations'),
                order.load('certificate')
            ])
            await Promise.all(order.authorizations.map(item => item.load('challenges')))
            return attachAction(order.toJSON())
        } else {
            throw new HttpNotFoundException('Order Not Found')
        }
    }

    /**
     * Create Order
     */
    async store({ workspaceId, request }: HttpContextContract) {

        await request.validate(CertificateOrderValidator)

        const domains = request.input('domains')
        const accountId = request.input('accountId')
        const dnsProviderCredentialId = request.input('dnsProviderCredentialId')

        if (!workspaceId) {
            throw new Error('WorkspaceId required')
        }
        const order = await CertificateOrder.createFromRemote({
            domains,
            authorityAccountId: accountId,
            dnsProviderCredentialId,
            workspaceId
        })

        return attachAction(order.toJSON())
    }

    async processing({ workspaceId, params }: HttpContextContract) {
        const order = await CertificateOrder.query().where({
            workspaceId,
            id: params['id'],
            authorityId: params['authorityId']
        }).first()
        if (!order) {
            throw new HttpNotFoundException('Order Not Found')
        }
        const state = await order.process()
        if (!order.authorizations) {
            await order.load('authorizations')
        }
        const authorizations = await Promise.all(order.authorizations.map(item => item.action()))
        return {
            authorityId: order.authorityId,
            id: order.id,
            order: state,
            authorizations
        }
    }
}
