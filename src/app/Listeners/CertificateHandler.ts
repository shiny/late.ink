import Config from '@ioc:Adonis/Core/Config'
import CertificateOrder from 'App/Models/CertificateOrder'
import Job from 'App/Models/Job'

export default class CertificateHandler {
    public async createRenewalJob(order: CertificateOrder) {

        await order.load('certificate')
        const certificate = order.certificate
        if (!certificate.validToFromCrt) {
            throw new Error(`Certificate #{certificateId}'s validTo is null`)
        }
        const delayMs = Config.get('app.renewBeforeExpirationMs')
        // same outerId only have one renewal job

        return Job.firstOrCreate({
            workspaceId: certificate.workspaceId,
            outerId: certificate.id,
        }, {
            name: 'Renew',
            data: {
                certificateId: certificate.id
            },
            outerId: certificate.id,
            workspaceId: certificate.workspaceId,
            nextRunAt: certificate.validToFromCrt.minus(delayMs),
            status: 'Available'
        })
    }
}
