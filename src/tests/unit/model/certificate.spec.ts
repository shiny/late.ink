import { test } from '@japa/runner'
import fs from "node:fs/promises"
import path from 'node:path'
import Certificate from 'App/Models/Certificate'

test.group('model/certificate', () => {
    test('cert expiredDate', async ({ assert }) => {
        const pem = await fs.readFile(path.join(__dirname, '../../resources', 'example.crt'))
        const cert = new Certificate
        cert.crt = pem.toString()
        assert.equal(cert?.validToFromCrt?.toFormat('yyyy-MM-dd HH:mm:ss'), '2023-08-05 23:59:59')
    })
})
