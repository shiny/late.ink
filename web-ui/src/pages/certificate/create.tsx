import FormCreateCertificate from "@/components/FormCreateCertificate"

export default function Create() {
    return <div className="p-10">
        <div className="text-lg breadcrumbs">
            <ul>
                <li><a>证书</a></li>
                <li>创建证书</li>
            </ul>
        </div>
        <div className="mt-10">
            <FormCreateCertificate />
        </div>
    </div>
}
