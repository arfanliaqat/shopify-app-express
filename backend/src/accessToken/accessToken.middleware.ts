import { NextFunction, Request, Response } from "express"
import { fetchAccessToken } from "../auth/auth.service"
import { getLocals } from "../util/locals"
import { findAccessTokenByShopId } from "./accessToken.service"

export async function loadAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
	const { connectedShop } = getLocals(res)
	if (connectedShop) {
		res.locals.accessToken = await findAccessTokenByShopId(connectedShop.id)
	}
	next()
}
