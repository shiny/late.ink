/**
 * Contract source: https://git.io/JfefG
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type CertificateAuthorization from "App/Models/CertificateAuthorization";
import CertificateChallenge from "App/Models/CertificateChallenge";
import type CertificateOrder from "App/Models/CertificateOrder";

declare module '@ioc:Adonis/Core/Event' {
    /*
    |--------------------------------------------------------------------------
    | Define typed events
    |--------------------------------------------------------------------------
    |
    | You can define types for events inside the following interface and
    | AdonisJS will make sure that all listeners and emit calls adheres
    | to the defined types.
    |
    | For example:
    |
    | interface EventsList {
    |   'new:user': UserModel
    | }
    |
    | Now calling `Event.emit('new:user')` will statically ensure that passed value is
    | an instance of the the UserModel only.
    |
    */
    interface EventsList {
        'order:ready:ready': CertificateOrder
        'order:ready:completed': CertificateOrder

        'order:valid:ready': CertificateOrder
        'order:valid:completed': CertificateOrder

        'authorization:pending:ready': CertificateAuthorization
        'authorization:pending:completed': CertificateAuthorization

        'challenge:pending:ready': CertificateChallenge
        'challenge:pending:completed': CertificateChallenge

        'deploymentjob:execute': { id: number }
    }
    interface EmitterTransportContract {
        emitSerial(event: string, data: any): Promise<any>;
    }
}
