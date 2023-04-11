import { schema, rules, CustomMessages, validator } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const MIN_LENGTH = 8
export const Schema = schema.create({
    password: schema.string([rules.minLength(MIN_LENGTH)]),
})

export default class PasswordValidator {
    constructor(protected ctx: HttpContextContract) {}

    /*
     * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
     *
     * For example:
     * 1. The username must be of data type string. But then also, it should
     *    not contain special characters or numbers.
     *    ```
     *     schema.string({}, [ rules.alpha() ])
     *    ```
     *
     * 2. The email must be of data type string, formatted as a valid
     *    email. But also, not used by any other user.
     *    ```
     *     schema.string({}, [
     *       rules.email(),
     *       rules.unique({ table: 'users', column: 'email' }),
     *     ])
     *    ```
     */
    public schema = Schema

    /**
     * Custom messages for validation failures. You can make use of dot notation `(.)`
     * for targeting nested fields and array expressions `(*)` for targeting all
     * children of an array. For example:
     *
     * {
     *   'profile.username.required': 'Username is required',
     *   'scores.*.number': 'Define scores as valid numbers'
     * }
     *
     */
    public messages: CustomMessages = {
        'password.minLength': `Password should at least have ${MIN_LENGTH} characters`,
    }

    /**
     * validate password
     * @param password string
     * @returns
     */
    public static async validate(password: string) {
        return validator.validate({
            schema: Schema,
            data: {
                password,
            },
        })
    }
}
