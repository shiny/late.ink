import { test } from '@japa/runner'
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'

test.group('validator', () => {

  const correctWorkspace = 1
  const incorrectWorkspace = 2

  const data = {
    accountId: 1
  }
    test("check workspaceId", async ({ assert }) => {
      const result = await validator.validate({
        schema: schema.create({
          accountId: schema.number([
            rules.workspaceId('user_workspaces', correctWorkspace)
          ])
        }),
        data
      })
      assert.deepEqual(result, data)

      await assert.rejects(async () => {
        await validator.validate({
          schema: schema.create({
            accountId: schema.number([
              rules.workspaceId('user_workspaces', incorrectWorkspace)
            ])
          }),
          data
        })
      })
    })
})
