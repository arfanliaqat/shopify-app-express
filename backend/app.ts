import express, { Application, Request, Response } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"

const app: Application = express()

let server: https.Server | http.Server
let port: number
if (process.env.MODE != "production") {
    const httpsOptions = {
        cert: fs.readFileSync(__dirname + "/../certs/shopify-app.dev.crt"),
        key: fs.readFileSync(__dirname + "/../certs/shopify-app.dev.key")
    }
    server = https.createServer(httpsOptions, app)
    port = 443
} else {
    // In prod, SSL will be dealt with by ngnix
    server = http.createServer(app)
    port = 80
}

app.get("/", (req: Request, res: Response) => {
    res.status(200).send(`Server running at port ${port}`)
})

app.use("/app", express.static("../frontend/public"))

server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})
