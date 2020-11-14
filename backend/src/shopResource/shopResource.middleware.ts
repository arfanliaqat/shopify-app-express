import { NextFunction, Request, Response } from "express"
import { findShopResourceById } from "../shopResource/shopResource.service"
import { Forbidden, HandledError, handleErrors, UnexpectedError } from "../util/error"
import { getLocals } from "../util/locals"

export async function loadShopResource(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const { connectedShop } = getLocals(res)
		const { shopResourceId } = req.params
		if (!shopResourceId) {
			throw new UnexpectedError("No shopResourceId provided")
		}
		const shopResource = await findShopResourceById(shopResourceId)
		if (!shopResource) {
			throw new HandledError("Shop resource not found")
		}
		if (!connectedShop || !shopResource.belongsTo(connectedShop)) {
			throw new Forbidden("The shop resource doesn't belong to the shop")
		}
		res.locals.shopResource = shopResource
		next()
	} catch (error) {
		handleErrors(res, error)
	}
}
