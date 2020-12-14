import { NextFunction, Request, Response } from "express"
import { getLocals } from "../util/locals"
import { AccessTokenService } from "./accessToken.service"

export async function loadAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
	const { connectedShop } = getLocals(res)
	if (connectedShop && connectedShop.id) {
		res.locals.accessToken = await AccessTokenService.findAccessTokenByShopId(connectedShop.id)
	}
	next()
}
