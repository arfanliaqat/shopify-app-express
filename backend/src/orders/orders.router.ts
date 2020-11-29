import { NextFunction, Request, Response, Router, raw } from "express"
import { findShopByDomain } from "../shop/shop.service"
import { handleErrors, BadParameter } from "../util/error"
import { getLocals, Locals } from "../util/locals"
import crypto from "crypto"
import { hooksSecret } from "../util/constants"

const router = Router()

router.use("/hooks", raw({ type: "application/json" }))

function loadHookContext(req: Request, res: Response, next: NextFunction) {
	try {
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

async function authenticateHook(req: Request, res: Response, next: NextFunction) {
	try {
		const locals = getLocals(res)
		if (!locals.hookContext) throw new BadParameter("hookContext` is missing")
		if (!locals.hookContext.hmac) throw new BadParameter("`hmac` is missing from `hookContext`")
		const generatedHmac = crypto.createHmac("sha256", hooksSecret).update(req.body).digest("base64")
		if (generatedHmac != locals.hookContext.hmac) {
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

router.post("/hooks/orders", [loadHookContext, authenticateHook, loadConnectedShop], (req: Request, res: Response) => {
	try {
		console.log(JSON.parse(req.body))
		res.end()
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
