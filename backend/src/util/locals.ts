import { Response } from "express"
import { AccessToken } from "../accessToken/accessToken.model"
import { AvailabilityPeriod } from "../availabilityPeriods/availabilityPeriods.model"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { HookContext } from "./hooks"

export interface Locals {
	connectedShop?: Shop
	accessToken?: AccessToken
	shopResource?: ShopResource
	availabilityPeriod?: AvailabilityPeriod
	hookContext?: HookContext
}

export function getLocals(res: Response): Locals {
	return res.locals as Locals
}
