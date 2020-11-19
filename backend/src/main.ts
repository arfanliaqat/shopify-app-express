import express, { Application } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

import dotenv from "dotenv"
dotenv.config()

import authRouter from "./auth/auth.router"
import shopResourceRouter from "./shopResource/shopResource.router"
import deliverySlotsRouter from "./deliverySlots/deliverySlots.router"
import { loadConnectedShop } from "./shop/shop.middleware"

const app: Application = express()

let server: https.Server | http.Server
if (process.env.NODE_ENV != "production") {
	const httpsOptions = {
		cert: fs.readFileSync("./certs/shopify-app.dev.crt"),
		key: fs.readFileSync("./certs/shopify-app.dev.key")
	}
	server = https.createServer(httpsOptions, app)
} else {
	// In prod, SSL will be dealt with by ngnix
	server = http.createServer(app)
}

const sessionSecretKey = process.env.SESSION_SECRET_KEY || ""
if (sessionSecretKey.length == 0) throw "Missing SESSION_SECRET_KEY"
if (sessionSecretKey.length < 64) throw "SESSION_SECRET_KEY should be at least 64 chars"
app.use(cookieParser(sessionSecretKey))

app.use(bodyParser.json())

app.set("etag", false)

app.use((req, res, next) => {
	res.removeHeader("X-Powered-By")
	next()
})

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`)
	next()
})

app.set("views", __dirname + "/../../../src/views")
app.set("view engine", "ejs")

app.get("/app*", loadConnectedShop, async (req, res) => {
	const { connectedShop } = res.locals
	res.render("index", {
		apiKey: process.env.SHOPIFY_API_PUBLIC_KEY,
		shopOrigin: connectedShop.domain
	})
})

app.use(
	"/public",
	express.static("/../../../../frontend/public", {
		setHeaders: (res) => {
			if (process.env.NODE_ENV != "production") {
				res.setHeader("Cache-Control", "no-cache")
			}
		}
	})
)

app.use(authRouter)
app.use(shopResourceRouter)
app.use(deliverySlotsRouter)

const port = parseInt(process.env.PORT || "3000")
server.listen(port, () => {
	console.log(`Server running at port ${port}`)
})
