import Route from "@ioc:Adonis/Core/Route"

Route.group(() => {
    Route.resource('/certificate', 'CertificateController')
    Route.get('/certificate/:id/download', 'CertificateController.download')
})
.prefix('/api/v1')
.middleware('auth:web')
