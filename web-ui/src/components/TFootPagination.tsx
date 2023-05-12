
import Pagination from "@/components/Pagination"
import type { Pagination as PaginationResponse } from "@late/Response"
import { useSearchParams } from "react-router-dom"

export default function TFootPagination ({ value }: { value: PaginationResponse<any> }) {

    const [ searchParams, setSearchParams ] = useSearchParams()
    const page = searchParams.get('page') || '1'

    return <tfoot>
        <tr>
            <th colSpan={0} align="left">
                <Pagination
                    className="pt-4 px-4"
                    perPage={value.meta.per_page}
                    total={value.meta.total}
                    page={parseInt(page)}
                    goto={page => setSearchParams({ page: page.toString() })}
                />
            </th>
        </tr>
    </tfoot>
}
