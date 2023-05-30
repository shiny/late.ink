
export interface InputConfigInterface {
    name: string
    type?: 'text' | 'password' | 'number' | 'url' | 'tel' | 'email' | 'divider'
    default?: string | number
    rows?: number
    className?: string
    required?: boolean
}
