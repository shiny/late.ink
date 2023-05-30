export interface Certificate {
    domains: string[]
    csr: string
    privateKey: string
    crt: string
    algorithm: string
    expiredAt: Date
}
