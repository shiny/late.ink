import Lottie from "lottie-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import certificate from "@/assets/certificate-cuy.json?url"
import { useDataFromLoader } from "@/utils/router"

export async function loader() {
    const res = await fetch(certificate)
    return res.json()
}

export function Component() {
    
    const { t } = useTranslation("translation", {
        keyPrefix: "introduce"
    })

    const animationData = useDataFromLoader(loader)

    return <div className="hero min-h-[80vh]">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <Lottie loop={false} animationData={animationData} />
                <h1 className="text-5xl font-bold">{t('first_cert')}</h1>
                <p className="py-6">{t('first_cert_description')}</p>
                <Link to="/certificate/create">
                    <button className="btn btn-primary">{t('get_started')}</button>
                </Link>
                <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
            </div>
        </div>
    </div>
}
