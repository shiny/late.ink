interface IconProps {
    className?: string
}
const defaultProps = {
    className: ''
}
export const IconSun = ({ className }: IconProps = defaultProps) => <svg
    className={`fill-current ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24">
    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
</svg>

export const IconMoon = ({ className }: IconProps = defaultProps) => <svg
    className={`fill-current ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
>
    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
</svg>

export const IconLang = ({ className }: IconProps) => <svg
    className={`${className}`}
    viewBox="0 0 48 48" fill="none"><path d="M42 43l-2.385-6M26 43l2.384-6m11.231 0l-.795-2-4.18-10h-1.28l-4.181 10-.795 2m11.231 0h-11.23M17 5l1 5M5 11h26M11 11s1.889 7.826 6.611 12.174C22.333 27.522 30 31 30 31" stroke="#4E5969" strokeWidth="2" /><path d="M25 11s-1.889 7.826-6.611 12.174C13.667 27.522 6 31 6 31" stroke="#4E5969" strokeWidth="2" /></svg>

export const IconCert = ({ className }: IconProps) => <svg
    className={className ?? ''}
    viewBox="0 0 48 48" >
    <path fillRule="evenodd" clipRule="evenodd" d="M24.999 1.347l1.077.757c.083.059.162.123.234.194-.067-.065-.055-.065-.054-.067 0-.002-.007-.006-.068-.048.088.06.2.134.33.218.373.24.816.509 1.318.795a37.83 37.83 0 004.824 2.306c1.659.654 3.43 1.093 5.19 1.353.619.092 1.191.154 1.7.192.294.022.542.034.6.034l1.783.028a1.91 1.91 0 011.879 1.908l.001 1.837.002 4.38.001 2.61a24347.202 24347.202 0 01.002 8.072V26.63l-.001.046v.014c-.014 9.194-11.785 20.13-19.911 20.13C15.78 46.818 4 35.868 4 26.671V9.018a1.91 1.91 0 011.879-1.909l1.818-.028c.026 0 .275-.012.568-.034.509-.038 1.08-.1 1.7-.192 1.759-.26 3.53-.699 5.184-1.352a38.254 38.254 0 004.825-2.31c.844-.48 1.603-.968 1.755-1.084l1.068-.757a1.909 1.909 0 012.202-.005zm14.999 16.499l-.001-2.61-.002-4.339c-.531-.012-1.565-.096-2.703-.264-2.03-.3-4.078-.808-6.033-1.58-3.093-1.22-6.283-2.988-7.356-3.804-.344.244-1.157.759-2.04 1.261a42.053 42.053 0 01-5.31 2.544c-1.953.77-4 1.278-6.03 1.579-1.159.17-2.21.255-2.705.265v15.774C7.818 33.695 17.828 43 23.906 43c6.082 0 16.093-9.304 16.093-16.328v-.757-1.999l-.001-6.07zm-6.734.861a1 1 0 010 1.414l-8.485 8.485-1.415 1.415a1 1 0 01-1.414 0l-1.415-1.414v-.001l-4.242-4.242a1 1 0 010-1.414l1.414-1.415a1 1 0 011.414 0l3.536 3.536 7.778-7.778a1 1 0 011.414 0l1.415 1.414z" />
</svg>

export const IconDnsVerification = ({ className }: IconProps) => <svg
    className={`${className ?? ''} stroke`}
    viewBox="0 0 48 48">
    <path d="M39 6H9a1 1 0 00-1 1v34a1 1 0 001 1h30a1 1 0 001-1V7a1 1 0 00-1-1z" />
    <path d="M8 7a1 1 0 011-1h30a1 1 0 011 1v34a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM32.072 16.518l-4.14 15.454" />
    <path d="M23.071 17L16 24.071l7.071 7.071" />
</svg>

export const IconAcmeAccount = ({ className }: IconProps) => <svg
    className={className ?? ''}
    viewBox="0 0 48 48">
    <path fillRule="evenodd" clipRule="evenodd" d="M17 9a5.001 5.001 0 000 10 5.001 5.001 0 000-10zm-9 5a9 9 0 1118 0 9 9 0 01-18 0zm3.67 16C8.03 30 5 32.997 5 36.8V40h24v-3.2c0-3.803-3.03-6.8-6.67-6.8H11.67zM1 36.8C1 30.835 5.78 26 11.67 26h10.66C28.22 26 33 30.835 33 36.8v5.4c0 .994-.8 1.8-1.78 1.8H2.78C1.8 44 1 43.194 1 42.2v-5.4zM45.67 42h-8.94v-4H43v-1.2c0-2.004-1.69-3.8-4-3.8h-2.62a10.92 10.92 0 00-1.97-4H39c4.42 0 8 3.492 8 7.8v3.9c0 .718-.6 1.3-1.33 1.3zM33 20c0-1.105.9-2 2-2s2 .895 2 2-.9 2-2 2-2-.895-2-2zm2-6c-3.31 0-6 2.686-6 6s2.69 6 6 6 6-2.686 6-6-2.69-6-6-6z" />
</svg>

export const IconDeployment = ({ className }: IconProps) => <svg
    className={className ?? ''}
    viewBox="0 0 48 48">
    <path fillRule="evenodd" clipRule="evenodd" d="M46 8a2 2 0 00-2-2H4a2 2 0 00-2 2v32a2 2 0 002 2h40a2 2 0 002-2V8zM6 12h36v26H6V12zm23 4a1 1 0 011 1v2a1 1 0 01-1 1H11a1 1 0 01-1-1v-2a1 1 0 011-1h18zm9 4v-4h-4v4h4z" />
</svg>

export const IconLoading = ({ className }: IconProps) => <svg
    className={`${className ?? 'w-6 h-6'} animate-spin`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>

export const IconInfo = ({ className }: IconProps) => <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
</svg>

export const IconAdd = ({ className }: IconProps) => <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>

export const IconChecked = ({ className }: IconProps) => <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
</svg>

export const IconMore = ({ className }: IconProps) => <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}>
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
    />
</svg>

export const IconPlay = ({ className }: IconProps) => <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
</svg>
