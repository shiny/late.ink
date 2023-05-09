import Cache from '@ioc:Adonis/Addons/Cache'

export type TargetType = 'Order' | 'Authorization' | 'Challenge'
const DefaultExpiredSeconds = 60 * 60 * 24 * 30 * 2 // almost two months
export const enum returnedState {
    ready,
    processing,
    completed,
    error
}
export type ReturnedState = keyof typeof returnedState
/**
 * Action states
 * 1. before action: ready
 * 2. duration action: processing
 * 3. after action: completed
 * 4. action error: error
 */
export default class CertificateAction {

    public static key(type: TargetType, step: string,  id: number) {
        return `action:${type}:${step}:${id}`
    }
    // key: order:${id}
    // key: authorization:${id}
    // key: challenge:${id}
    public static async whatAbout(type: TargetType, step: string, id: number): Promise<ReturnedState> {
        const key = CertificateAction.key(type, step, id)
        const content = await Cache.get(key)
        if (!content) {
            return 'ready'
        }
        return content
    }

    /**
     * Start a Job
     * Next state: done / error
     * @param type 
     * @param step 
     * @param id 
     * @returns 
     */
    public static async start(type: TargetType, step: string, id: number) {
        return CertificateAction.setWhen({
            type,
            step,
            id,
            state: 'processing',
            when: 'ready'
        })
    }

    public static async done(type: TargetType, step: string, id: number) {
        return CertificateAction.setWhen({
            type,
            step,
            id,
            state: 'completed',
            when: 'processing'
        })
    }

    public static async error(type: TargetType, step: string, id: number, _description: string) {
        console.error(_description)
        return CertificateAction.setWhen({
            type,
            step,
            id,
            state: 'error',
            when: 'processing'
        })
    }

    public static async get(type: TargetType, step: string, id: number) {
        const key = CertificateAction.key(type, step, id)
        const content = await Cache.get(key)
        if (!content) {
            return 'ready'
        } else {
            return content
        }
    }

    public static async set(type: TargetType, step: string, id: number, state: ReturnedState) {
        const key = CertificateAction.key(type, step, id)
        if (state === 'processing') {
            return Cache.add(key, state, DefaultExpiredSeconds)
        } else {
            return Cache.set(key, state, DefaultExpiredSeconds)
        }
    }

    public static async setWhen({ type, step, id, state, when }: {
        type: TargetType, step: string, id: number, state: ReturnedState, when: ReturnedState
    }) {
        const content = await CertificateAction.get(type, step, id)
        if (content !== when) {
            console.error(`Only ${when} state can turn to ${state}`)
            // throw new Error(`Only ${when} state can turn to ${state}`)
            return false
        } else {
            return CertificateAction.set(type, step, id, state)
        }
    }
}

export async function attachAction(target, type: TargetType = 'Order') {
        // attach action to Order
        if (type === 'Order') {
            target['action'] = await CertificateAction.whatAbout(type, target.status, target.id)
            target['authorizations'] = await attachAction(target['authorizations'], 'Authorization')
            return target
        }
        // guarantee target is an Array (authorizations or challenges)
        if (!Array.isArray(target)) {
            return
        }
        // Target is a Challenge
        if (type === 'Challenge') {
            return Promise.all(target.map(async (item) => {
                item['action'] = await CertificateAction.whatAbout('Challenge', item.status, item.id)
                return item
            }))
        // target is a Authorization
        } else if(type === 'Authorization') {
            return Promise.all(target.map(async item => {
                item['action'] = await CertificateAction.whatAbout('Authorization', item.status, item.id)
                if (Array.isArray(item?.challenges)) {
                    item['challenges'] = await attachAction(item['challenges'], 'Challenge')
                }
                return item
            }))
        }
}