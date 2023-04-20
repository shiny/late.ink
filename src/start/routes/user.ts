
import Route from '@ioc:Adonis/Core/Route'

Route.post('/api/v1/user/login', 'User/AuthenticationController.login')
Route.get('/api/v1/user/logout', 'User/AuthenticationController.logout')
Route.get('/api/v1/user/state', 'User/AuthenticationController.state').middleware('auth:web')