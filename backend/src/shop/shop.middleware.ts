import { NextFunction, Request, Response } from "express"
import { getSession } from "../util/session"
import { ShopService } from "./shop.service"

export async function loadConnectedShop(req: Request, res: Response, next: NextFunction): Promise<void> {
	const { shopId } = getSession(req)
	if (!shopId) {
		console.error("Missing shopId in the session")
		res.status(403).send("Forbidden")
		return
	}
	const shop = await ShopService.findById(shopId)
	if (!shop) {
		console.error("Shop not found")
		res.status(403).send("Forbidden")
		return
	}
	res.locals.connectedShop = shop
	next()
}
