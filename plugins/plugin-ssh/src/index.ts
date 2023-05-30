import { DeploymentPluginBase, Certificate } from "@late.ink/plugin-base"

import icon from "./Icon"
import locales from "./Locales"
import inputConfig from "./InputConfig"

import { Client, WriteStreamOptions } from "ssh2"

type FieldName = typeof inputConfig[number]['name']
export type PluginConfig = {
    [Field in FieldName]: string | number
}

export default class PluginSsh extends DeploymentPluginBase {
    public static icon = icon
    public static locales = locales
    public static inputConfig = [ ...inputConfig]

    constructor(public config?: PluginConfig) {
        super()
        this.validateConfig(config)
    }

    validateConfig(config?: PluginConfig) {
        if (!config) {
            throw new Error('Config is required')
        }
        if (!config.host) {
            throw new Error('host is required')
        }
        if (!config.username) {
            throw new Error('username is required')
        }
        if (!config.sshKey) {
            throw new Error('sshKey is required')
        }
    }

    async test() {
        await this.getConnectedClient()
        return true
    }

    async run(cert: Certificate) {
        const config = this.config
        if (!config) {
            return false
        }
        this.validateConfig(config)
        const client = await this.getConnectedClient()
        await this.writeToFile(client, config.privateKeyPath.toString(), cert.privateKey)
        await this.writeToFile(client, config.certFilePath.toString(), cert.crt)
        if (config.reloadCommand) {
            const output = await this.execute(client, config.reloadCommand.toString())
            console.log(output)
        }
        return true
    }

    async execute(client, cmd: string) {
        if (!this.config) {
            throw new Error('Config is missing')
        }
        
        return new Promise((resolve, reject) => {
            client.exec(cmd, (err, stream) => {
                if (err) {
                    return reject(err)
                }
                let responseData = "";
                stream.on('close', function () {
                    resolve(responseData)
                }).on('data', function (data: Buffer | string) {
                    responseData += data.toString()
                }).stderr.on('data', function (data: Buffer | string) {
                    responseData += data.toString()
                })
            })
        })
    }

    async writeToFile(client: Client, path: string, content: string, options?: WriteStreamOptions) {
        options = {
            flags: 'w',
            mode: 0o666,
            autoClose: true,
            ...(options || {})
        }
        return new Promise<void>((resolve, reject) => {
            client.sftp((err, sftp) => {
                if (err) {
                    reject(err)
                }
                const stream = sftp.createWriteStream(path, options)
                if (!stream.write(content, (err) => {
                    if (err) {
                        reject(err)
                    }
                })) {
                    stream.once('drain', resolve)
                } else {
                    resolve()
                }
            })
        })
    }

    async getConnectedClient(): Promise<Client> {
        const client = new Client()
        return new Promise((resolve, reject) => {
            client.on('ready', () => resolve(client))
            .on('error', (err) => reject(err))
            .connect({
                host: this.config?.host.toString(),
                port: parseInt(this.config?.port.toString() || '22'),
                username: this.config?.username.toString(),
                privateKey: this.config?.sshKey.toString()
            })
        })
    }
}
