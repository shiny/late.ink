import Route from "@ioc:Adonis/Core/Route"

// You can use 
// .paramFor('api/v1/authority', 'authorityId')
// to rename `:api_v1_authority_id` to `:authorityId`
// 
// or just prefix('/api/v1') to use a short param 

Route.group(() => {
    
    Route.resource('/authority', 'Authority/AuthorityController')

    Route.resource('/authority.account', 'Authority/AccountController')
        .paramFor('authority', 'authorityId')

    Route.post('/authority/:authorityId/account/:id/test', 'Authority/AccountController.test')
    
    Route.resource('/authority.order', 'Authority/OrderController')
        .paramFor('authority', 'authorityId')
    Route.get('/authority/:authorityId/order/:id/processing', 'Authority/OrderController.processing')
})
.prefix('/api/v1')
.middleware('auth:web')
