import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new HttpNotFoundException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class HttpNotFoundException extends Exception {

    constructor(public message: string, status: number = 404, code: string = 'E_HTTP_NOT_FOUND') {
        super(message, status, code)
    }

    public async handle(error: this, ctx: HttpContextContract) {
        ctx.response.status(error.status).send(error.message)
    }
}
