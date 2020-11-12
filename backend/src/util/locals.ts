import { Response } from "express"
import { AccessToken } from "../accessToken/accessToken.model"
import { Shop } from "../shop/shop.model"

export interface Locals {
	connectedShop?: Shop
	accessToken?: AccessToken
}

export function getLocals(res: Response): Locals {
	return res.locals as Locals
}
