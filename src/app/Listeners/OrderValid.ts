import CertificateOrder from 'App/Models/CertificateOrder'
import Database from '@ioc:Adonis/Lucid/Database'
import CertificateAction from 'App/Utils/CertificateAction'
import Certificate from 'App/Models/Certificate'

export default class OrderValid {
    public async onReady(order: CertificateOrder) {
        const trx = await Database.transaction()
        try {
            await CertificateAction.start('Order', order.status, order.id)
            const cert = await Certificate.findByOrFail('order_id', order.id)
            await order.load('authorityAccount')
            const ca = await order.authorityAccount.resolveInstance()
            const acmeOrder = await ca.restoreOrder(order.url)
            cert.crt = await acmeOrder.downloadCertification()
            if (cert.validToFromCrt)
                cert.expiredAt = cert.validToFromCrt
            await cert.save()
            await CertificateAction.done('Order', order.status, order.id)
        } catch (error) {
            await trx.rollback()
            throw error
        }
    }

    /**
     * do the final clean jobs
     * @param order 
     */
    public async onCompleted(order: CertificateOrder) {
        await order.load('authorizations')
        for(const auth of order.authorizations) {
            const challenge = await auth.dnsChallenge()
            await challenge.removeDns()
        }
    }
}
