import { DateTime } from 'luxon'
import { column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import { string } from '@ioc:Adonis/Core/Helpers'
import PasswordValidator from 'App/Validators/PasswordValidator'
import Database from '@ioc:Adonis/Lucid/Database'

import BaseModel from './BaseModel'
import Workspace from './Workspace'
import UserWorkspace from './UserWorkspace'

export interface UserRegisterOptions {
    userName: string
    passwordSize: number
    /**
     * wether or not to create the default personal workspace
     * default: true
     */
    createDefaultWorkspace?: boolean
    /**
     * Join the new User into a default workspace
     */
    joinWorkspaceId?: number
}

export type RandomPassword = string

export class UserExistsError extends Error {}

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public password: string

    @column()
    public rememberMeToken: string

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

    public static async register({
        userName,
        passwordSize,
        createDefaultWorkspace,
        joinWorkspaceId,
    }: UserRegisterOptions): Promise<RandomPassword> {
        const password = User.generateRandomizePassword(passwordSize)
        const trx = await Database.transaction()

        try {
            const existUser = await User.findBy('name', userName, { client: trx })
            if (existUser) {
                throw new UserExistsError()
            }
            const user = new User()
            user.name = userName
            user.password = password
            await user.useTransaction(trx).save()

            // default create
            if (createDefaultWorkspace === undefined || createDefaultWorkspace) {
                const workspace = new Workspace()
                const relation = new UserWorkspace()
                workspace.isPersonal = true
                workspace.founderId = user.id
                await workspace.useTransaction(trx).save()

                relation.workspaceId = workspace.id
                relation.userId = user.id
                await relation.useTransaction(trx).save()
            }

            if (joinWorkspaceId) {
                const relation = new UserWorkspace()
                relation.workspaceId = joinWorkspaceId
                relation.userId = user.id
                await relation.useTransaction(trx).save()
            }
            await trx.commit()
        } catch (err) {
            await trx.rollback()
            throw err
        }

        return password
    }
}
