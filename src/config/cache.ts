import { cacheConfig } from '@melchyore/adonis-cache/build/config'

export default cacheConfig({
    prefix: 'cache_',

    store: 'file',

    stores: {
        /*
        |--------------------------------------------------------------------------
        | File store
        |--------------------------------------------------------------------------
        |
        | Use this store to store cache in files.
        | The 'disk' value must point to an existing
        | disk inside config/drive.ts, e.g:
        | {
        |   cache: {
        |     driver: 'local',
        |     visibility: 'private',
        |     root: Application.tmpPath('the-path-you-want-to-use'),
        |   },
        | }
        |
        | Don't forget to inform Typescript about the new disk:
        | Open the pre-existing contracts/drive.ts file and
        | update the `DisksList` interface with the following code:
        | cache: {
        |   config: LocalDriverConfig
        |   implementation: LocalDriverContract
        | }
        |
        */
        file: {
            driver: 'file',
            disk: 'cache'
        },
    },

    /*
    |--------------------------------------------------------------------------
    | Time to live (TTL)
    |--------------------------------------------------------------------------
    |
    | TTL is expressed in seconds.
    | 
    */
    ttl: 60,

    /*
    |--------------------------------------------------------------------------
    | Cache events
    |--------------------------------------------------------------------------
    |
    | Enable/disable cache events.
    | 
    */
    events: {
        'cache:hit': true,
        'cache:missed': true,
        'cache:key_written': true,
        'cache:key_forgotten': true
    }
})
