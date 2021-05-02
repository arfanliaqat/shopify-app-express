import { NextFunction, Request, Response } from "express"
import { ShopService } from "./shop.service"
import jwt from "jsonwebtoken"
import { shopifyApiSecretKey } from "../util/constants"

export function getJwtTokenFromReq(req: Request): string {
	const header = (req.headers.authorization?.toString() || "").replace("Bearer ", "")
	if (!header) {
		return req.query.authToken?.toString() || ""
	} else {
		return header
	}
}

export async function loadConnectedShop(req: Request, res: Response, next: NextFunction): Promise<void> {
	const jwtToken = getJwtTokenFromReq(req)
	const decodedToken = jwt.verify(jwtToken, shopifyApiSecretKey) as any
	const shopDomain = (decodedToken["dest"] || "").replace("https://", "")
	if (!shopDomain) {
		console.error("The JWT token couldn't be verified")
		res.status(403).send("Forbidden")
		return
	}
	const shop = await ShopService.findByDomain(shopDomain)
	if (!shop) {
		console.error("Shop not found")
		res.status(403).send("Forbidden")
		return
	}
	res.locals.connectedShop = shop
	next()
}
