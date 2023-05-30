
const locales = {
    'zh-CN': {
        plugin: {
            name: 'SSH 远程部署',
            btnTest: "测试 SSH 连接"
        },
        certFilePath: '证书目标路径',
        privateKeyPath: '证书 key 目标路径',
        reloadCommand: '重载证书的命令',
        connection: "🔗 SSH 连接",
        host: 'SSH 主机',
        port: '端口',
        username: 'SSH 用户名',
        sshKey: 'SSH 私钥',
        placeholder: {
            reloadCommand: "在远程主机上执行命令，重新载入新证书",
            certFilePath: "例如：/etc/ssl/www.example.com.crt",
            privateKeyPath: "例如：/etc/ssl/www.example.com.key",
            sshKey: "以 -----BEGIN *** PRIVATE KEY----- 开头的私钥"
        },
        instruction: {
            host: "ip 地址或域名",
            certFilePath: "证书 crt 文件绝对路径，确保有写入权限",
            privateKeyPath: "证书 key 文件绝对路径，确保有写入权限",
            reloadCommand: "建议使用绝对路径",
            sshKey: "私钥，确保该私钥能连接目标主机。可使用 ssh-keygen -t ed25519 生成。不支持密码部署。"
        },
    },
    en: {
        plugin: {
            name: 'SSH remote deployment',
            btnTest: "test SSH connection"
        },
        certFilePath: 'Cert File Target Path',
        privateKeyPath: 'Cert Key Target Path',
        reloadCommand: 'Reload Command',
        connection: "🔗 SSH connection",
        host: 'SSH Host',
        port: 'Port',
        username: 'SSH UserName',
        sshKey: 'SSH Private Key',
        placeholder: {
            reloadCommand: "execute command on remote server, to reloading the cert",
            certFilePath: "e.g. /etc/ssl/www.example.com.crt",
            privateKeyPath: "e.g. /etc/ssl/www.example.com.key",
            sshKey: "Private SSH Key Begins with -----BEGIN *** PRIVATE KEY-----"
        },
        instruction: {
            host: "ip address or a domain",
            certFilePath: "certificate crt file absolute path, make sure you have the write permission",
            privateKeyPath: "certificate key file absolute path, make sure you have the write permission",
            reloadCommand: "recommends to use a absolute path"
        }
    }
}

export default locales
