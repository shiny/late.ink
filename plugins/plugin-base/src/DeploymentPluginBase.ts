import { Certificate } from "./CertificateInterface"
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
    abstract run(cert: Certificate): Promise<boolean>
    /**
     * a human readable name for display 
     */
    abstract displayTargetName(): Promise<string> | string
}

export interface DeploymentPluginContract extends DeploymentPluginBase {

}
