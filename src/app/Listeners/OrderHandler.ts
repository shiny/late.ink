import CertificateOrder from 'App/Models/CertificateOrder'
import CertificateAction from 'App/Utils/CertificateAction'
import Certificate from 'App/Models/Certificate'
import { createEcdsaCsr } from 'handyacme'
import Database from '@ioc:Adonis/Lucid/Database'

export default class OrderHandler {

    public async finalizeCertificate(order: CertificateOrder) {
        await CertificateAction.start('Order', order.status, order.id)
        
        if (!order.authorityAccount) {
            await order.load('authorityAccount')
        }

        const {
            privateKey,
            csr
        } = await createEcdsaCsr(order.domains, "pem")
        
        const ca = await order.authorityAccount.resolveInstance()
        const acmeOrder = await ca.restoreOrder(order.url)
        await acmeOrder.finalize(csr)

        const trx = await Database.transaction()
        try {
            // this is a renewal order, update the orderId in certificate
            if (order.certificateId) {
                const certificate = await Certificate.findOrFail(order.certificateId, { client: trx })
                certificate.privateKey = privateKey
                certificate.csr = csr
                certificate.algorithm = 'ECDSA'
                certificate.orderId = order.id
                await certificate.save()
            } else {
                // this is an new issue, create a certificate 
                const certificate = await Certificate.create({
                    workspaceId: order.workspaceId,
                    privateKey,
                    csr,
                    algorithm: 'ECDSA',
                    domains: order.domains,
                    orderId: order.id,
                }, { client: trx })
                order.certificateId = certificate.id
            }
            await order.useTransaction(trx).save()
            await trx.commit()
        } catch (error) {
            await trx.rollback()
            throw error
        }
        await CertificateAction.done('Order', order.status, order.id)
    }

    public async downloadCertificate(order: CertificateOrder) {
        await CertificateAction.start('Order', order.status, order.id)
        const cert = await Certificate.findByOrFail('order_id', order.id)
        await order.load('authorityAccount')
        const ca = await order.authorityAccount.resolveInstance()
        const acmeOrder = await ca.restoreOrder(order.url)
        cert.crt = await acmeOrder.downloadCertification()
        if (cert.validToFromCrt) {
            cert.expiredAt = cert.validToFromCrt
        }
        await cert.save()
        await CertificateAction.done('Order', order.status, order.id)
    }

    /**
     * do the final cleaning jobs
     * @param order 
     */
    public async cleanAll(order: CertificateOrder) {
        await order.load('authorizations')
        for(const auth of order.authorizations) {
            const challenge = await auth.dnsChallenge()
            await challenge.removeDns()
        }
    }

    public async refreshAcmeStatus(order: CertificateOrder) {
        await order.load('authorityAccount')
        const ca = await order.authorityAccount.resolveInstance()
        const {
            status,
            certificateUrl
        } = await ca.restoreOrder(order.url)
        if (order.status !== status) {
            order.status = status
            order.certificateUrl = certificateUrl
            await order.save()
        }
    }
}
