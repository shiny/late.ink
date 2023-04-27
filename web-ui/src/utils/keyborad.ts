
export function isDeletingKey(key: string) {
    return ['Backspace', 'Delete', 'Escape'].includes(key)
}

export function isEnterKey(key: string) {
    return key === 'Enter'
}

export function isTabKey(key: string) {
    return key === 'Tab'
}
