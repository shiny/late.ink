import { test } from '@japa/runner'

test('user login state', async ({ client }) => {
    const response = await client.get('/api/v1/user/state')
    response.assertStatus(401)
})
