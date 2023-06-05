import Event from '@ioc:Adonis/Core/Event'

/**
 *  # ACME Order State Changing Flow
 *  @see https://datatracker.ietf.org/doc/html/rfc8555#section-7.1.6
 * 
 *  pending --------------+
 *         |                  |
 *         | All authz        |
 *         | "valid"          |
 *         V                  |
 *       ready ---------------+
 *         |                  |
 *         | Receive          |
 *         | finalize         |
 *         | request          |
 *         V                  |
 *     processing ------------+
 *         |                  |
 *         | Certificate      | Error or
 *         | issued           | Authorization failure
 *         V                  V
 *       valid             invalid
 * 
 *  ## Step One: pending
 *  1. pending:ready - Go authoring (e.g. Set a DNS text record)
 *  2. pending:processing - Authorizing
 *  3. pending:completed - Authorized, wait for the server process
 *       Verify the local authorzation and fetch state from remote
 *       e.g. check the DNS record, fetch auth state when DNS has been set
 *  
 *  ## Step Two: ready
 *  1. ready:ready - Start
 *  2. ready:processing - Finalizing an order
 *  3. ready:completed - Certificate have been finalized
 * 
 *  ## Step Three: processing
 *  - processing
 * 
 *  ## Step Four: valid
 *  1. valid:ready - Start
 *  2. valid:processing - Download the certificate
 *  3. valid:completed - Certificate has been downloaded
 * 
 *  ## Errors
 *  - pending:error - Error on authorizing
 *  - ready:error - Error on Finalizing certificate
 *  - valid:error - Error on downloading
 *  - invalid - Verified failed via  ACME protocal
 * 
 *  ## Failed to get the mutex
 *  - ignore - A same job is running
 */
Event.on('order:pending:ready', 'OrderHandler.startAuthorizing')
Event.on('order:pending:completed', 'OrderHandler.emitAuthorizations')

Event.on('order:ready:ready', 'OrderHandler.finalizeCertificate')

Event.on('order:valid:ready', 'OrderHandler.downloadCertificate')
Event.on('order:valid:ready', 'OrderHandler.cleanAll')
Event.on('order:valid:ready', 'CertificateHandler.createRenewalJob')

Event.on('authorization:pending:ready', 'AuthorizationHandler.startChallenging')
Event.on('authorization:pending:completed', 'AuthorizationHandler.refreshAcmeStatus')
Event.on('authorization:valid', 'AuthorizationHandler.refreshAcmeStatus')

Event.on('challenge:pending:ready', 'ChallengeHandler.setDns')
Event.on('challenge:pending:completed', 'ChallengeHandler.refreshAcmeStatus')
Event.on('challenge:valid', 'ChallengeHandler.refreshAcmeStatus')
/**
 * Deployment Events
 * 
 * ## do a deployment
 * deploymentjob:execute
 */
Event.on('deploymentjob:execute', 'DeploymentJob.onExecute')

/**
 * Trigger a schedule check
 * schedule:run
 */
Event.on('schedule:run', 'Schedule.run')
