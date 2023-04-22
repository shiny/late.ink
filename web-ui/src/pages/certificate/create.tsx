import FormCreateCertificate from "@/components/FormCreateCertificate"

export function Component() {
    return <div className="px-10">
        <div>
            <FormCreateCertificate />
        </div>
    </div>
}

export const handle = {
    crumb: {
        title: 'certificate.create_cert'
    }
}
