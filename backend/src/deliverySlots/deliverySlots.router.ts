import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { HandledError, handleErrors, FormError, FormErrors, UnexpectedError } from "../util/error"
import { getLocals } from "../util/locals"
import moment, { Moment } from "moment"
import { createDeliverySlot, deleteDeliverySlot, findDeliverySlots, updateShopResource } from "./deliverySlots.service"
import _ from "lodash"
import { loadShopResource } from "../shopResource/shopResource.middleware"
import { DeliverySlot } from "./deliverySlots.model"
import { loadDeliverySlot } from "./deliverySlots.middleware"
import { ShopResourceService } from "../shopResource/shopResource.service"

const router = Router()

router.get(
	"/resources/:shopResourceId/calendar_page",
	[loadConnectedShop, loadShopResource],
	async (req: Request, res: Response) => {
		try {
			const { shopResource } = getLocals(res)
			const { from, to } = req.query
			if (!from || !to) {
				throw new HandledError("Missing from/to parameters")
			}
			const mFrom = moment(from.toString())
			const mTo = moment(to.toString())
			if (mFrom.diff(mTo, "days") > 45) {
				throw new HandledError("Incorrect from/to parameters")
			}
			const slots = await findDeliverySlots(shopResource?.id || "", mFrom, mTo)
			res.send({ shopResource, deliverySlots: DeliverySlot.toViewModels(slots) })
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

function validateDates(errors: FormError[], strDates?: any): Moment[] | undefined {
	if (!strDates) {
		errors.push({ field: "dates", message: "Please select dates" })
		return
	}
	if (!_.isArray(strDates)) {
		throw new UnexpectedError("Dates should be an array of strings")
	}
	return strDates.map((date) => moment(date))
}

function validateQuantity(errors: FormError[], quantity?: any): number | undefined {
	if (!quantity) errors.push({ field: "quantity", message: "Please provide a quantity" })
	if (!_.isNumber(quantity)) errors.push({ field: "quantity", message: "The quantity should be a number" })
	return quantity
}

router.post(
	"/resources/:shopResourceId/slots",
	[loadConnectedShop, loadShopResource],
	async (req: Request, res: Response) => {
		try {
			const { shopResource } = getLocals(res)
			const errors = [] as FormError[]
			const dates = validateDates(errors, req.body.dates)
			const quantity = validateQuantity(errors, req.body.quantity)
			if (!dates || !quantity || errors.length > 0) throw new FormErrors(errors)
			const deliverySlot = await createDeliverySlot(shopResource?.id || "", dates, quantity)
			res.send(deliverySlot?.toViewModel())
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.get(
	"/delivery_slots/:deliverySlotId/page",
	[loadConnectedShop, loadDeliverySlot],
	async (req: Request, res: Response) => {
		try {
			const { deliverySlot } = getLocals(res)
			if (!deliverySlot) {
				throw new UnexpectedError("deliverySlot should be loaded")
			}
			const shopResource = await ShopResourceService.findShopResourceById(deliverySlot.shopResourceId)
			if (!shopResource) {
				throw new UnexpectedError("shopResource not found")
			}
			res.send({ shopResource: shopResource.toViewModel(), deliverySlot: deliverySlot.toViewModel() })
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.post(
	"/delivery_slots/:deliverySlotId",
	[loadConnectedShop, loadDeliverySlot],
	async (req: Request, res: Response) => {
		try {
			const { deliverySlot } = getLocals(res)
			if (!deliverySlot) throw new UnexpectedError("deliverySlot cannot be undefined")
			const errors = [] as FormError[]
			const newDates = validateDates(errors, req.body.newDates)
			const quantity = validateQuantity(errors, req.body.quantity)
			if (!newDates || !quantity || errors.length > 0) throw new FormErrors(errors)
			deliverySlot.addNewDates(newDates)
			deliverySlot.quantity = quantity
			await updateShopResource(deliverySlot)
			res.send({})
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.delete(
	"/delivery_slots/:deliverySlotId",
	[loadConnectedShop, loadDeliverySlot],
	async (req: Request, res: Response) => {
		try {
			const { deliverySlot } = getLocals(res)
			if (!deliverySlot) throw new UnexpectedError("deliverySlot cannot be undefined")
			// TODO: prevent deletion of there are orders...
			await deleteDeliverySlot(deliverySlot)
			res.send({})
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
