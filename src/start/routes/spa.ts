
import fs from "node:fs"
import Route from '@ioc:Adonis/Core/Route'

const routeFile = "../../public/routes.json"
if (fs.existsSync(routeFile)) {
    const content = fs.readFileSync(routeFile)
    const routes = JSON.parse(content.toString())
    routes.forEach(route => {
        Route.get(route, ({ response }) => {
            const html = fs.createReadStream(__dirname+'/../public/index.html')
            response.stream(html)
        })
    })
}
