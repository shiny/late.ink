import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMatches } from "react-router-dom";

export type MatchedItem = Omit<ReturnType<typeof useMatches>[number], 'handle'> & {
    handle: any
}

function BreadcrumbItem(crumb: { title: string, to?: string}) {
    const { t } = useTranslation('translation')
    if (crumb.to) {
        return <Link to={crumb.to}>
            {t(crumb.title)}
        </Link>
    } else {
        return <span>{t(crumb.title)}</span>
    }
}

export default function Breadcrumbs() {
    const { t } = useTranslation('translation')
    const matches = useMatches()
    const crumbs = matches.filter((match: MatchedItem) => Boolean(match?.handle?.crumb))
        .map((match: MatchedItem) => match.handle.crumb)

    return <div className="breadcrumbs">
        <ul>
            {crumbs.map((crumb, index) => <li key={index}>
                <BreadcrumbItem
                    title={crumb.title}
                    to={crumb.to} />
            </li>)}
        </ul>
    </div>
}
