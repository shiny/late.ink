export default abstract class DeploymentPluginBase {
    /**
     * this is a deployment plugin
     * for deploy the certificate
     */
    public static category: 'Deployment' = 'Deployment'
    public static inputConfig: Record<string, any>[]
    public static locales: Record<string, Record<string, any>>
    public static icon: string
    abstract test(): Promise<boolean>
    abstract run(): Promise<boolean>
    abstract validate(config: Record<string, any>): Promise<boolean>
}

export interface DeploymentPluginContract extends DeploymentPluginBase {

}
