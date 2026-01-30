import configs from "../configs.js"
import express from "express"
const InitializeServer = () => {
    const app = express()
    const port = configs.api.port ? parseInt(configs.api.port.toString()) : 8080
    app.set('port', port)
    return app
}

const StartServer = (app: express.Application) => {
    const port = app.get('port')
    app.listen(port, () => {
        console.log(`Servidor iniciado en puerto ${port}`)
    }).on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Puerto ${port} ya está en uso`)
        } else {
            console.error('Error al iniciar el servidor:', err.message)
        }
        process.exit(1)
    })
}

export default InitializeServer
export { StartServer }