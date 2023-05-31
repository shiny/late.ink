import Route from "@ioc:Adonis/Core/Route"

Route.group(() => {
    Route.resource('/deployment', 'Deployment/IndexController')
    Route.post('/deployment/validate', 'Deployment/IndexController.validate')
    Route.post('/deployment/:id/trigger', 'Deployment/IndexController.trigger')
})
.prefix('/api/v1')
.middleware('auth:web')
