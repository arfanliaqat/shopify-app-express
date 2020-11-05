import express, { Application, Request, Response } from "express"
import * as http from "http"

const app: Application = express()
const server: http.Server = http.createServer(app)
const port = 3000

app.get("/", (req: Request, res: Response) => {
    res.status(200).send(`Server running at port ${port}`)
})

app.use("/app", express.static("../frontend/public"))

server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})
