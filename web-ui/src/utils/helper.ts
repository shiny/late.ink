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
