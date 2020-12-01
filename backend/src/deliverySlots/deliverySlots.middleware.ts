import { NextFunction, Request, Response } from "express"
import { Forbidden, HandledError, handleErrors } from "../util/error"
import { getLocals } from "../util/locals"
import { DeliverySlotService } from "./deliverySlots.service"

export async function loadDeliverySlot(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const { connectedShop } = getLocals(res)
		const { deliverySlotId } = req.params
		const deliverySlot = await DeliverySlotService.findDeliverySlotById(deliverySlotId)
		if (!deliverySlot) {
			throw new HandledError("Delivery slot not found")
		}
		if (!deliverySlot.belongsTo(connectedShop)) {
			throw new Forbidden("The slot doesn't belong to the connected shop")
		}
		res.locals.deliverySlot = deliverySlot
		next()
	} catch (error) {
		handleErrors(res, error)
	}
}
