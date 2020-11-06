import express, { Application, Request, Response } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"
import cookieParser from "cookie-parser"

import dotenv from "dotenv"
dotenv.config()

import shopifyRouter from "./shopify/shopify.router"

const app: Application = express()

let server: https.Server | http.Server
if (process.env.MODE != "production") {
	const httpsOptions = {
		cert: fs.readFileSync(__dirname + "/../certs/shopify-app.dev.crt"),
		key: fs.readFileSync(__dirname + "/../certs/shopify-app.dev.key")
	}
	server = https.createServer(httpsOptions, app)
} else {
	// In prod, SSL will be dealt with by ngnix
	server = http.createServer(app)
}

app.use(cookieParser())

app.get("/", (req: Request, res: Response) => {
	res.status(200).send(`Server running at port ${port}`)
})

app.use("/app", express.static("../frontend/public"))

app.use(shopifyRouter)

const port = parseInt(process.env.PORT || "3000")
server.listen(port, () => {
	console.log(`Server running at port ${port}`)
})
