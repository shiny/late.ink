import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import { string } from '@ioc:Adonis/Core/Helpers'
import { validator } from '@ioc:Adonis/Core/Validator'
import PasswordValidator from 'App/Validators/PasswordValidator'

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public password: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    /**
     * hash password before save
     * @param user User
     */
    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            await PasswordValidator.validate(user.$dirty.password)
            user.password = await Hash.make(user.password)
        }
    }

    /**
     * create a random password
     * @param size number
     * @returns password: string
     */
    public static generateRandomizePassword(size = 8) {
        return string.generateRandom(size)
    }
}
