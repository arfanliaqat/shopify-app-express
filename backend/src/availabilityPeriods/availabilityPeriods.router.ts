import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { HandledError, handleErrors, FormError, FormErrors, UnexpectedError, Forbidden } from "../util/error"
import { getLocals } from "../util/locals"
import moment, { Moment } from "moment"
import { AvailabilityPeriodService } from "./availabilityPeriods.service"
import _ from "lodash"
import { loadShopResource } from "../shopResource/shopResource.middleware"
import { AvailabilityPeriod } from "./availabilityPeriods.model"
import { loadAvailabilityPeriod } from "./availabilityPeriods.middleware"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { ProductOrderService } from "../productOrders/productOrders.service"

const router = Router()

router.get(
	"/resources/:shopResourceId/calendar_page",
	[loadConnectedShop, loadShopResource],
	async (req: Request, res: Response) => {
		try {
			const { shopResource } = getLocals(res)
			if (!shopResource) {
				throw new HandledError("Missing shopResource")
			}
			const { from, to } = req.query
			if (!from || !to) {
				throw new HandledError("Missing from/to parameters")
			}
			const mFrom = moment(from.toString())
			const mTo = moment(to.toString())
			if (mFrom.diff(mTo, "days") > 45) {
				throw new HandledError("Incorrect from/to parameters")
			}
			const periods = await AvailabilityPeriodService.findAvailabilityPeriods(shopResource.id || "", mFrom, mTo)
			const ordersPerDate = await ProductOrderService.findOrdersSummedPerDate(shopResource.id || "", mFrom, mTo)
			res.send({ shopResource, availabilityPeriods: AvailabilityPeriod.toViewModels(periods), ordersPerDate })
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
	"/resources/:shopResourceId/availability_periods",
	[loadConnectedShop, loadShopResource],
	async (req: Request, res: Response) => {
		try {
			const { shopResource } = getLocals(res)
			const errors = [] as FormError[]
			const dates = validateDates(errors, req.body.dates)
			const quantity = validateQuantity(errors, req.body.quantity)
			const quantityIsShared = !!req.body.quantityIsShared
			if (!dates || !quantity || errors.length > 0) throw new FormErrors(errors)
			const availabilityPeriod = await AvailabilityPeriodService.createAvailabilityPeriod(
				shopResource?.id || "",
				dates,
				quantity,
				quantityIsShared
			)
			res.send(availabilityPeriod?.toViewModel())
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.get(
	"/availability_periods/:availabilityPeriodId/page",
	[loadConnectedShop, loadAvailabilityPeriod],
	async (req: Request, res: Response) => {
		try {
			const { connectedShop, availabilityPeriod } = getLocals(res)
			if (!connectedShop) {
				throw new UnexpectedError("connectedShop should be loaded")
			}
			if (!availabilityPeriod) {
				throw new UnexpectedError("availabilityPeriod should be loaded")
			}
			const shopResource = await ShopResourceService.findShopResourceById(availabilityPeriod.shopResourceId)
			if (!shopResource || !shopResource.id) {
				throw new UnexpectedError("shopResource not found")
			}
			if (!shopResource.belongsTo(connectedShop)) {
				throw new Forbidden("Shop resource doesn't not belong to the shop")
			}
			const ordersPerDate = await ProductOrderService.findOrdersSummedPerDate(
				shopResource.id,
				availabilityPeriod.startDate,
				availabilityPeriod.endDate
			)
			res.send({
				shopResource: shopResource.toViewModel(),
				availabilityPeriod: availabilityPeriod.toViewModel(),
				ordersPerDate
			})
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.post(
	"/availability_periods/:availabilityPeriodId",
	[loadConnectedShop, loadAvailabilityPeriod],
	async (req: Request, res: Response) => {
		try {
			const { availabilityPeriod } = getLocals(res)
			if (!availabilityPeriod) throw new UnexpectedError("availabilityPeriod cannot be undefined")
			const errors = [] as FormError[]
			const newDates = validateDates(errors, req.body.newDates)
			const deletedDates = validateDates(errors, req.body.deletedDates)
			const quantity = validateQuantity(errors, req.body.quantity)
			const quantityIsShared = !!req.body.quantityIsShared
			if (!quantity || errors.length > 0) throw new FormErrors(errors)
			availabilityPeriod.addNewDates(newDates)
			availabilityPeriod.deleteDates(deletedDates)
			availabilityPeriod.quantity = quantity
			availabilityPeriod.quantityIsShared = quantityIsShared
			await AvailabilityPeriodService.updateShopResource(availabilityPeriod)
			res.send({})
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.delete(
	"/availability_periods/:availabilityPeriodId",
	[loadConnectedShop, loadAvailabilityPeriod],
	async (req: Request, res: Response) => {
		try {
			const { availabilityPeriod } = getLocals(res)
			if (!availabilityPeriod) throw new UnexpectedError("availabilityPeriod cannot be undefined")
			// TODO: prevent deletion of there are orders...
			await AvailabilityPeriodService.deleteAvailabilityPeriod(availabilityPeriod)
			res.send({})
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
