/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import Event from '@ioc:Adonis/Core/Event'

Event.on('order:ready:ready', 'OrderReady.onReady')
Event.on('order:ready:completed', 'OrderReady.refresh')

Event.on('order:valid:ready', 'OrderValid.onReady')
Event.on('order:valid:completed', 'OrderValid.onCompleted')
Event.on('order:valid:completed', 'CertificateRenewalJob.create')

Event.on('deploymentjob:execute', 'DeploymentJob.onExecute')
