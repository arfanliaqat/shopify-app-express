import express, { Application, Request, Response } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"
import cookieParser from "cookie-parser"

import dotenv from "dotenv"
dotenv.config()

import authRouter from "./auth/auth.router"
import { getSession } from "./util/session"
import { findShopById } from "./shop/shop.service"

const app: Application = express()

let server: https.Server | http.Server
if (process.env.MODE != "production") {
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

app.set("etag", false)

app.use((req, res, next) => {
	res.removeHeader("X-Powered-By")
	next()
})

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`)
	next()
})

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

app.get("/app*", async (req, res) => {
	// disable X-Frame-Options as per shopify doc: https://shopify.dev/tools/app-bridge/getting-started
	// res.setHeader("X-Frame-Options", "DENY")

	const { shopId } = getSession(req)
	if (!shopId) {
		console.error("Missing shopId in the session")
		res.status(403).send("Forbidden")
		return
	}

	const shop = await findShopById(shopId)
	if (!shop) {
		console.error("Shop not found")
		res.status(403).send("Forbidden")
		return
	}

	res.render("index", {
		apiKey: process.env.SHOPIFY_API_PUBLIC_KEY,
		shopOrigin: shop.domain
	})
})

app.use(
	"/public",
	express.static("../frontend/public", {
		setHeaders: (res) => {
			if (process.env.MODE != "production") {
				res.setHeader("Cache-Control", "no-cache")
			}
		}
	})
)

app.use(authRouter)

const port = parseInt(process.env.PORT || "3000")
server.listen(port, () => {
	console.log(`Server running at port ${port}`)
})
