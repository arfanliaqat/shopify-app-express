import { Response } from "express"
import { AccessToken } from "../accessToken/accessToken.model"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"

export interface Locals {
	connectedShop?: Shop
	accessToken?: AccessToken
	shopResource?: ShopResource
}

export function getLocals(res: Response): Locals {
	return res.locals as Locals
}
