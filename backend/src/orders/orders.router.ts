import bodyParser from "body-parser"
import { NextFunction, Request, Response, Router } from "express"
import { findShopByDomain } from "../shop/shop.service"
import { shopifyApiSecretKey } from "../util/constants"
import { handleErrors, BadParameter } from "../util/error"
import { getLocals, Locals } from "../util/locals"
import crypto from "crypto"

const router = Router()

function loadHookContext(req: Request, res: Response, next: NextFunction) {
	try {
		console.log("::loadHookContext")
		const locals = res.locals as Locals
		locals.hookContext = {
			topic: req.header("X-Shopify-Topic"),
			hmac: req.header("X-Shopify-Hmac-Sha256"),
			shopDomain: req.header("X-Shopify-Shop-Domain"),
			apiVersion: req.header("X-Shopify-API-Version")
		}
		if (!locals.hookContext.topic) throw new BadParameter("X-Shopify-Topic is missing")
		if (!locals.hookContext.hmac) throw new BadParameter("X-Shopify-Hmac-Sha256 is missing")
		if (!locals.hookContext.shopDomain) throw new BadParameter("X-Shopify-Shop-Domain is missing")
		next()
	} catch (error) {
		handleErrors(res, error)
	}
}

// function parseRawBody() {
// 	console.log("::parseRawBody")
// 	return bodyParser.json({
// 		limit: "2mb",
// 		verify: function (req: any, res: any, buf: any, encoding: string) {
// 			req.textBody = buf.toString(encoding)
// 		}
// 	})
// }

function authenticateHook(req: Request, res: Response, next: NextFunction) {
	console.log("::authenticateHook")
	try {
		const locals = getLocals(res)
		if (!locals.hookContext) throw new BadParameter("hookContext` is missing")
		if (!locals.hookContext.hmac) throw new BadParameter("`hmac` is missing from `hookContext`")
		// const rawBody = (req as any).textBody
		// if (!rawBody) throw new BadParameter("Missing `textBody`... Missing raw body parser?")
		const generatedHmac = crypto.createHmac("sha256", shopifyApiSecretKey).update(req.body).digest("base64")
		if (generatedHmac != locals.hookContext) {
			throw new BadParameter("Incorrect HMAC")
		}
		next()
	} catch (error) {
		handleErrors(res, error)
	}
}

async function loadConnectedShop(req: Request, res: Response, next: NextFunction) {
	try {
		const locals = getLocals(res)
		if (!locals.hookContext) throw new BadParameter("hookContext` is missing")
		if (!locals.hookContext.shopDomain) throw new BadParameter("`shopDomain` is missing from `hookContext`")
		locals.connectedShop = await findShopByDomain(locals.hookContext.shopDomain)
		if (!locals.connectedShop) throw new BadParameter("Shop not found")
		next()
	} catch (error) {
		handleErrors(res, error)
	}
}

router.post(
	"/hooks/orders",
	[loadHookContext, bodyParser.text({ type: "application/json" }), authenticateHook, loadConnectedShop],
	(req: Request, res: Response) => {
		console.log("::ROUTE!")
		try {
			console.log(JSON.parse(req.body))
			res.end()
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
