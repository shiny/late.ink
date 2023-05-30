import Route from "@ioc:Adonis/Core/Route"

Route.group(() => {
    Route.resource('/plugin', 'PluginController')
})
.prefix('/api/v1')
.middleware('auth:web')
