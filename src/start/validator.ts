/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
|    @example
|    ```typescript
|    const schema = schema.create({
|        accountId: schema.number([
|        rules.workspaceId('authority_accounts', this.ctx.workspaceId)
|    ]),
|    ```
|
*/
import { validator } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

/**
 */
validator.rule('workspaceId', async (id: number, [ tableName, workspaceId ]: [ string, number ], options) => {
    let validated = false
    if (id > 0) {
        const result = await Database.connection()
            .from(tableName)
            .select('id')
            .where('id', id)
            .where('workspace_id', workspaceId)
            .limit(1)
        validated = result.length > 0
    }

    if (!validated) {
        options.errorReporter.report(
            options.pointer,
            'workspaceId',
            'workspaceId validation failed',
            options.arrayExpressionPointer
        )
    }
}, () => ({
    async: true
}))
