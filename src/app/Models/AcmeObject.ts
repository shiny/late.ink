import CertificateAction, { TargetType } from "App/Utils/CertificateAction"
import BaseModel from "./BaseModel"
import CertificateOrder from "./CertificateOrder"
import Event from '@ioc:Adonis/Core/Event'

export default abstract class AcmeObject extends BaseModel {

    status: string
    id: number
    public abstract readonly acmeObjectType: TargetType
    order?: CertificateOrder
    url: string
    public abstract readonly statesShouldProcess: string[]

    public async start() {
        return CertificateAction.start(this.acmeObjectType, this.status, this.id)
    }

    public async done() {
        return CertificateAction.done(this.acmeObjectType, this.status, this.id)
    }

    public async failed(error: any) {
        return CertificateAction.error(this.acmeObjectType, this.status, this.id, error.message)
    }

    public async syncFromRemote(fields: string[] = []) {
        const order = await this.getAcmeOrderObject()
        if (!order.authorityAccount) {
            await order.load('authorityAccount')
        }
        const ca = await order.authorityAccount.resolveInstance()
        const restoreMethod = `restore${this.acmeObjectType}`
        const responseData = await ca[restoreMethod](this.url)
        if (responseData.status !== this.status) {
            this.status = responseData.status
            for(const field of fields) {
                this[field] = responseData[field]
            }
            await this.save()
        }
        return this
    }

    public async getCurrentState(): Promise<string> {
        if (this.statesShouldProcess.includes(this.status)) {
            const state = await CertificateAction.whatAbout(this.acmeObjectType, this.status, this.id)
            return `${this.status}:${state}`
        } else {
            return this.status
        }
    }

    /**
     * use a Serial Emit for default
     */
    public async emitState() {
        await this.emitStateSerial()
    }

    private async emitStateSerial() {
        const state = await this.getCurrentState()
        await Event.transport.emitSerial(`${this.acmeObjectType.toLowerCase()}:${state}`, this)
    }

    async getAcmeOrderObject(): Promise<CertificateOrder> {
        if (this instanceof CertificateOrder) {
            return this
        } else {
            if (!this.order) {
                // @ts-expect-error
                await this.load('order')
            }
            if (!this.order) {
                throw new Error('Relation "order" on AcmeObject is required')
            } else {
                return this.order
            }
        }
    }
}
