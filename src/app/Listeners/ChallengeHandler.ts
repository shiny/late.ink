import CertificateChallenge from "App/Models/CertificateChallenge";

/**
 * State Transitions for Challenge Objects
 * ```markdown
 *            pending
 *               |
 *               | Receive
 *               | response
 *               V
 *           processing <-+
 *               |   |    | Server retry or
 *               |   |    | client retry request
 *               |   +----+
 *               |
 *               |
 *   Successful  |   Failed
 *   validation  |   validation
 *     +---------+---------+
 *     |                   |
 *     V                   V
 *   valid              invalid
 * ```
 **/
export default class ChallengeHandler {
    public async setDns(challenge: CertificateChallenge) {
        if(!await challenge.start()) {
            throw new Error('Failed to start an challenge')
        }
        try {
            await challenge.setDns()
            await challenge.done()
        } catch (error) {
            if (error.code !== 'ECONNRESET') {
                await challenge.failed(error.message)
            }
            throw error
        }
    }

    public async refreshAcmeStatus(challenge: CertificateChallenge) {
        // must verify before refresh challenge
        // or challenge would became invalid
        if (challenge.status === 'pending') {
            if (!await challenge.isVerified()) {
                // havn't been taken effect yet
                return false
            }
        }
        await challenge.syncFromRemote()
    }
}
