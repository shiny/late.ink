import { NetConnectOpts } from 'node:net'

interface DetachedEvent {
  server: NetConnectOpts,
  client: NetConnectOpts
}

const detachedEvent: DetachedEvent = {
  server: {
    host: '127.0.0.1',
    port: 1988
  },
  client: {
    host: '127.0.0.1',
    port: 1988,
    timeout: 120000
  }
}
export default detachedEvent
