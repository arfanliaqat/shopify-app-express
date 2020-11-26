import express, { Application } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import path from "path"
import morgan from "morgan"

import dotenv from "dotenv"
dotenv.config()

import authRouter from "./auth/auth.router"
import shopResourceRouter from "./shopResource/shopResource.router"
import deliverySlotsRouter from "./deliverySlots/deliverySlots.router"
import widgetRouter from "./widget/widget.router"
import { loadConnectedShop } from "./shop/shop.middleware"

const app: Application = express()

const isDev = process.env.NODE_ENV != "production"

let server: https.Server | http.Server
if (isDev) {
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
if (isDev) {
	app.use(morgan("[:date[clf]] :method :url :status :response-time ms"))
}
app.use(bodyParser.json())

app.set("etag", false)

app.use((req, res, next) => {
	res.removeHeader("X-Powered-By")
	next()
})

app.set("views", path.join(process.cwd(), "src/views"))
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
	express.static(path.join(process.cwd(), "../frontend/public"), {
		setHeaders: (res) => {
			if (isDev) {
				res.setHeader("Cache-Control", "no-cache")
			}
		}
	})
)

app.use(authRouter)
app.use(shopResourceRouter)
app.use(deliverySlotsRouter)

app.use(cors())
app.use(
	"/widget",
	express.static(path.join(process.cwd(), "../widget/build"), {
		setHeaders: (res) => {
			if (isDev) {
				res.setHeader("Cache-Control", "no-cache")
			}
		}
	})
)
app.use(widgetRouter)

const port = parseInt(process.env.PORT || "3000")
server.listen(port, () => {
	console.log(`Server running at port ${port}`)
})
