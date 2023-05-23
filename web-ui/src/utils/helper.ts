export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function arrayRange(start: number, end?: number, step = 1) {
    const output = []
    if (typeof end === 'undefined') {
        end = start
        start = 0
    }
    if (end < start) {
        return []
    }
    for (let i = start; i <= end; i += step) {
        output.push(i)
    }
    return output
}

type debounceFn<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => void) & {
    cancel: () => void
}

export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number): debounceFn<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const debouncedFn = function (this: any, ...args: Parameters<T>) {
        const self = this
        const later = function () {
            timeoutId = undefined
            fn.apply(self, args)
        }
        clearTimeout(timeoutId)
        timeoutId = setTimeout(later, wait)
    } as debounceFn<T>

    debouncedFn.cancel = function () {
        clearTimeout(timeoutId)
        timeoutId = undefined
    }

    return debouncedFn
}
