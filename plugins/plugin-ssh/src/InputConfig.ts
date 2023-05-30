import { InputConfigInterface } from '@late.ink/plugin-base'
const inputConfig: InputConfigInterface[] = [
    { name: 'certFilePath', type: "text", },
    { name: 'privateKeyPath', type: "text",  },
    { name: 'reloadCommand', type: "text", rows: 2 },
    { name: 'connection', type: 'divider' },
    { name: 'host', type: "text", className: 'w-1/2', },
    { name: 'port', type: "number", default: 22, className: 'w-32'},
    { name: 'username', type: "text", className: 'w-1/2', },
    { name: 'sshKey', type: "text", rows: 2, },
]
export default [ ...inputConfig ] as const

