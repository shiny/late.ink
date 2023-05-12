
declare module "@late/Response" {
    /**
     * Adonis Pagination Response
     * @docs https://docs.adonisjs.com/reference/database/query-builder#tojson
     * 
     * @example
     * ```typescript
     * interface Credential {
     *     id: number
     *     dnsProdiverId: number
     *     name: ''
     * }
     * const response: Pagination<Credential> = await fetch(...)
     * ```
     */
    export interface Pagination<T> {
        meta: {
            total: number
            per_page: number
            current_page: number
            last_page: number
            first_page: number
        },
        data: T[]
    }
}
