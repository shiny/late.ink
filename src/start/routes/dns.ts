import Route from "@ioc:Adonis/Core/Route"

// You can use 
// .paramFor('api/v1/authority', 'authorityId')
// to rename `:api_v1_authority_id` to `:authorityId`
// 
// or just prefix('/api/v1') to use a short param 

Route.group(() => {
    Route.resource('/dns/provider', 'DnsProvider/ProviderController').only(['index'])
    Route.resource('/dns/provider.credential', 'DnsProvider/CredentialController')
        .paramFor('dns/provider', 'providerId')
        .only(['index', 'store'])
    Route.post('/dns/provider/:providerId/test', 'DnsProvider/CredentialController.test')
})
.prefix('/api/v1')
.middleware('auth:web')
Route.get('/test', 'HomeController.index')