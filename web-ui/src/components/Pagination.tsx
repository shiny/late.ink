import { arrayRange } from "@/utils/helper"

interface PaginationProps {
    page: number
    total: number
    perPage: number
    className?: string
    hideIfOnlyOnePage?: boolean
    goto?: (page: number) => void 
}

type Pages = Array<number | '.'>

function createPages(currentPage: number, maxPage: number) {
    // Pagination style: 1,2,3 ... 10,11,12 ... 18,19,20
    const pages: number[] = []
    
    const start = 1
    const end = maxPage < 3 ? maxPage : 3
    pages.push(...arrayRange(start, end))

    const middleStart = (currentPage - 1) <= pages[pages.length-1] ? pages[pages.length-1] + 1 : (currentPage - 1)
    const middleEnd = (currentPage + 1) > maxPage ? maxPage : (currentPage + 1)
    if (middleStart <= middleEnd) {
        pages.push(...arrayRange(middleStart, middleEnd))
    }

    const lastStart = (maxPage - 2) > pages[pages.length-1] ? (maxPage - 2) : pages[pages.length-1] + 1
    const lastEnd = maxPage
    if (lastStart <= lastEnd) {
        pages.push(...arrayRange(lastStart, lastEnd))
    }

    let last = 0
    const targetNumbers: number[] = []
    pages.forEach((p) => {
        // Not a sequence number
        if (last !== (p-1)) {
            targetNumbers.push(p)
        }
        last = p
    })
    const resultPages: Pages = pages
    targetNumbers.forEach(targetNumber => {
        const targetIndex = resultPages.findIndex(page => page === targetNumber)
        resultPages.splice(targetIndex, 0, '.')
    })

    return resultPages
}

export default function Pagination({ page, total, perPage, goto, hideIfOnlyOnePage, className }: PaginationProps) {

    if (total <= perPage && (hideIfOnlyOnePage ?? true)) {
        return <></>
    }

    const max = Math.ceil(total / perPage)
    const pages = createPages(page, max)
    const redirectTo = (page: number) => {
        if (page < 1) {
            return
        } else if (page > max) {
            return
        }
        console.log('max', max)
        if (goto) {
            goto(page)
        } else {
            // fu
        }
    }
    const disabled = (page: number, maxPage: number) => {
        if (page < 1) {
            return true
        } else if (page > maxPage) {
            return true
        } else {
            return false
        }
    }

    return <nav className={`${className ?? ''} isolate inline-flex -space-x-px rounded shadow-sm`} aria-label="Pagination">
        {max > 1 && <span
            onClick={() => redirectTo(page - 1)}
            className={`${disabled(page - 1, max) ? 'text-gray-400' : 'cursor-pointer'} relative inline-flex items-center rounded-l-md px-4 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
        >
            <span>上一页</span>
        </span>}
        {pages.map((item, index) => <Page
            isCurrent={item === page}
            page={item}
            key={`page-${index}`}
            onClick={redirectTo}
        />)}
        {max > 1 && <span
            onClick={() => redirectTo(page + 1)}
            className={`${disabled(page + 1, max) ? 'text-gray-400' : 'cursor-pointer'} relative inline-flex items-center rounded-r-md px-5 py-3  ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 text-xl`}
        >
            <span>下一页</span>
        </span>}
    </nav>
}

interface PageProps {
    page: number | '.'
    isCurrent: boolean
    onClick: (page: number) => void
}
export function Page({ page, isCurrent, onClick }: PageProps) {
    const classNames: string[] = []
    const isClickable = page !== '.' && !isCurrent
    if (isCurrent) {
        classNames.push('bg-[#E4F0F0]')
    }
    if (isClickable) {
        classNames.push('cursor-pointer')
    }
    if (!isCurrent) {
        classNames.push('hover:bg-gray-50')
    }
    if (page === '.') {
        return <span className="relative inline-flex items-center px-5 py-3 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 text-xl">
            ...
        </span>
    } else {
        return <span
            onClick={() => onClick(page)}
            aria-current="page"
            className={`${classNames.join(' ')} relative inline-flex items-center px-5 py-3 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 text-xl`}
        >
            {page}
        </span>
    }
}