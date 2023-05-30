
import Event, { EventsList, DataForEvent } from '@ioc:Adonis/Core/Event'
import net from 'node:net'
import Logger from '@ioc:Adonis/Core/Logger'
import Config from '@ioc:Adonis/Core/Config'

function emit<K extends keyof EventsList>(event: 'HealthyCheck', data: {}): Promise<void>
function emit<K extends keyof EventsList>(event: K, data: EventsList[K]): Promise<void>
function emit<K extends string>(event: K, data: DataForEvent<K>): Promise<void> {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(
            Config.get('detachedevent.client'),
            () => {
                let result = ''
                client.write(JSON.stringify({
                    event,
                    data
                }))
                client.write('\n\n')
                client.on('data', (data) => {
                    result += data.toString('utf8')
                    if (result === 'success') {
                        client.end()
                        resolve()
                    }
                })
                client.on('end', () => {
                    Logger.debug('DetachtedEvent client end: ', result)
                })
                client.on('timeout', () => {
                    client.end()
                    Logger.debug('DetachtedEvent client timeout')
                    reject('TIMEOUT')
                })
            }
        )

        client.on('error', reject)
    })
}

async function healthyCheck() {
    await emit('HealthyCheck', {})
}

function createServer() {
    process.on('SIGINT', () => {
        server.close((err) => {
            if (err) {
                Logger.error(err.message)
            }
        })
    })
    const server = net.createServer((client) => {
        let result = ''
        client.on('error', (err) => Logger.error(err.message))
        client.on('data', (data) => {
            result += data.toString('utf-8')
            if (result.endsWith('\n\n')) {
                const packet = JSON.parse(result)
                if (packet.event === 'HealthyCheck') {
                    client.write('success')
                    client.end()
                    return
                }
                Event.emit(packet.event, packet.data)
                    .then(() => {
                        if(!client.closed) {
                            client.write('success')
                            client.end()
                        }
                    })
            }
        })
        client.on('end', () => {
            Logger.debug('client disconnected')
        })
    })

    server.on('close', () => {
        Logger.info('Server have been closed.')
    })

    server.on('error', (err) => Logger.error(err.message))
    return server
}

export default {
    emit,
    createServer,
    healthyCheck
}
