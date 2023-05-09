import CertificateOrder from 'App/Models/CertificateOrder'
import Certificate from 'App/Models/Certificate'
import { createEcdsaCsr } from 'handyacme'
import CertificateAction from 'App/Utils/CertificateAction'
import Database from '@ioc:Adonis/Lucid/Database'

export default class OrderReady {
    public async onReady(order: CertificateOrder) {
        const trx = await Database.transaction()
        try {
            await CertificateAction.start('Order', order.status, order.id)
            const { privateKey, csr } = await createEcdsaCsr(order.domains, "pem")
            await Certificate.create({
                workspaceId: order.workspaceId,
                privateKey,
                csr,
                algorithm: 'ECDSA',
                domains: order.domains,
                orderId: order.id,
            }, { client: trx })
            await order.load('authorityAccount')
            const ca = await order.authorityAccount.resolveInstance()
            const acmeOrder = await ca.restoreOrder(order.url)
            await acmeOrder.finalize(csr)
            await CertificateAction.done('Order', order.status, order.id)
            await trx.commit()
        } catch (error) {
            await trx.rollback()
            throw error
        }
    }

    public async refresh(order: CertificateOrder) {
        const trx = await Database.transaction()
        try {
            await order.load('authorityAccount')
            const ca = await order.authorityAccount.resolveInstance()
            const acmeOrder = await ca.restoreOrder(order.url)
            if (order.status !== acmeOrder.status) {
                order.status = acmeOrder.status
                order.certificateUrl = acmeOrder.certificateUrl
                await order.save()
            }
            await trx.commit()
        } catch (error) {
            await trx.rollback()
            throw error
        }
    }
}
