import {
    BaseModel as OrmBaseModel,
    SnakeCaseNamingStrategy
} from '@ioc:Adonis/Lucid/Orm'
import { string } from '@ioc:Adonis/Core/Helpers'

export class CamelCaseNamingStrategy extends SnakeCaseNamingStrategy {
    public serializedName(_model: typeof BaseModel, propertyName: string) {
        return string.camelCase(propertyName)
    }
}

export default class BaseModel extends OrmBaseModel {
    public static namingStrategy = new CamelCaseNamingStrategy()
}
