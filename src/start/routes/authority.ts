import Route from "@ioc:Adonis/Core/Route"

Route.group(() => {
    Route.resource('/api/v1/authority', 'Authority/AuthorityController')
    Route.resource('/api/v1/authority.account', 'Authority/AccountController')
}).middleware('auth:web')
