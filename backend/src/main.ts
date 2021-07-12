import express, { Application, json, Request } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"
import cors from "cors"
import path from "path"
import morgan from "morgan"
import compression from "compression"
import useragent from "express-useragent"

import dotenv from "dotenv"
dotenv.config()

import authRouter from "./auth/auth.router"
import shopResourceRouter from "./shopResource/shopResource.router"
import availabilityPeriodsRouter from "./availabilityPeriods/availabilityPeriods.router"
import shopPlanRouter from "./shopPlan/shopPlan.router"
import widgetRouter from "./widget/widget.router"
import hooksRouter from "./hooks/hooks.router"
import gdprRouter from "./gdpr/gdpr.router"
import scriptTagsRouter from "./scriptTags/scriptTags.router"
import currentAvailabilitiesRouter from "./currentAvailabilities/currentAvailabilities.router"
import { appUrl, isDev } from "./util/constants"
import { noApiCallCache } from "./util/middlewares"

import "./currentAvailabilities/currentAvailabilities.job"

const app: Application = express()

let server: https.Server | http.Server
if (isDev && appUrl.indexOf("ngrok") == -1) {
	const httpsOptions = {
		cert: fs.readFileSync("./certs/shopify-app.dev.crt"),
		key: fs.readFileSync("./certs/shopify-app.dev.key")
	}
	server = https.createServer(httpsOptions, app)
} else {
	// In prod, SSL will be dealt with by ngnix
	server = http.createServer(app)
}

if (isDev) {
	app.use(morgan("[:date[clf]] :method :url :status :response-time ms"))
}

// JSON body parser
app.use((req, res, next) => {
	// Hooks need their own body parsing because of the HMAC verification
	if (!req.url.startsWith("/hooks") && !req.url.startsWith("/gdpr")) {
		json()(req, res, next)
	} else {
		next()
	}
})

app.set("etag", false)

app.use(compression())

app.use((req, res, next) => {
	res.removeHeader("X-Powered-By")
	next()
})

app.set("views", path.join(process.cwd(), "backend/src/views"))
app.set("view engine", "ejs")

app.get("/app*", async (req, res) => {
	res.render("index")
})

app.get("/privacy", async (req, res) => {
	res.render("privacy")
})

app.use(
	"/public",
	express.static(path.join(process.cwd(), "frontend/public"), {
		setHeaders: (res) => {
			if (isDev) {
				res.setHeader("Cache-Control", "no-cache")
			}
		}
	})
)

app.post("/errors", [useragent.express()], (req: Request) => {
	const browserInfo = req.useragent ? req.useragent.browser + " " + req.useragent.version : ""
	const osInfo = req.useragent?.os || ""
	const platformInfo = req.useragent?.platform || ""
	console.error(`JS error (Platform: ${platformInfo}; OS: ${osInfo}; Browser: ${browserInfo}) - \n${req.body.error}`)
})

app.use(noApiCallCache)
app.use(authRouter)
app.use(shopResourceRouter)
app.use(availabilityPeriodsRouter)
app.use(hooksRouter)
app.use(gdprRouter)
app.use(scriptTagsRouter)
app.use(currentAvailabilitiesRouter)
app.use(shopPlanRouter)

app.use(cors())
app.use(
	"/widget",
	express.static(path.join(process.cwd(), "widget/public"), {
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
