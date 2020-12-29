import { NextFunction, Request, Response } from "express"
import { Forbidden, HandledError, handleErrors } from "../util/error"
import { getLocals } from "../util/locals"
import { AvailabilityPeriodService } from "./availabilityPeriods.service"

export async function loadAvailabilityPeriod(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const { connectedShop } = getLocals(res)
		const { availabilityPeriodId } = req.params
		const availabilityPeriod = await AvailabilityPeriodService.findAvailabilityPeriodById(availabilityPeriodId)
		if (!availabilityPeriod) {
			throw new HandledError("Availability period not found")
		}
		if (!availabilityPeriod.belongsTo(connectedShop)) {
			throw new Forbidden("This availability period doesn't belong to the connected shop")
		}
		res.locals.availabilityPeriod = availabilityPeriod
		next()
	} catch (error) {
		handleErrors(res, error)
	}
}
