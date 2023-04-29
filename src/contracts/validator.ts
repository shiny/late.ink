declare module '@ioc:Adonis/Core/Validator' {
    interface Rules {
        workspaceId(tableName: string, workspaceId?: number): Rule
    }
  }
  