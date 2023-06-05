import CertificateAuthorization from 'App/Models/CertificateAuthorization'

/**
 * 
 * State Transitions for Authorization Objects
 * ```markdown
 *                   pending --------------------+
 *                      |                        |
 *    Challenge failure |                        |
 *           or         |                        |
 *          Error       |  Challenge valid       |
 *            +---------+---------+              |
 *            |                   |              |
 *            V                   V              |
 *         invalid              valid            |
 *                                |              |
 *                                |              |
 *                                |              |
 *                 +--------------+--------------+
 *                 |              |              |
 *                 |              |              |
 *          Server |       Client |   Time after |
 *          revoke |   deactivate |    "expires" |
 *                 V              V              V
 *              revoked      deactivated      expired
 * ```
 */
export default class AuthorizationHandler {
    /**
     * current only support DNS challenge
     * @param authorization 
     * @returns 
     */
    public async startChallenging(authorization: CertificateAuthorization) {
        const challenge = await authorization.dnsChallenge()
        if(!await authorization.start()) {
            throw new Error('Failed to start an authorization')
        }
        try {
            await challenge.emitState()
            await authorization.done()
        } catch (error) {
            if (error.code !== 'ECONNRESET') {
                await authorization.failed(error.message)
            }
            throw error
        }
    }

    public async refreshAcmeStatus(authorization: CertificateAuthorization) {
        const challenge = await authorization.dnsChallenge()
        await challenge.emitState()
        await authorization.syncFromRemote()
    }
}
