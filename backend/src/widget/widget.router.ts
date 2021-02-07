import { Request, Response, Router } from "express"
import { AvailabilityPeriodService } from "../availabilityPeriods/availabilityPeriods.service"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { handleErrors, UnexpectedError } from "../util/error"
import { AvailableDate } from "../availabilityPeriods/availabilityPeriods.model"
import { WidgetService } from "./widget.service"
import { loadConnectedShop } from "../shop/shop.middleware"
import { getLocals } from "../util/locals"
import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"

const router = Router()

router.get("/product_availability/:productId", async (req: Request, res: Response) => {
	try {
		const productId = parseInt(req.params.productId)
		const shopResource = await ShopResourceService.findShopResourceByProductId(productId)
		if (!shopResource || !shopResource.id) {
			res.status(404).send({ reason: "Resource not found" })
			return
		}
		const availableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource.id)
		const settings = await WidgetService.findOrCreateWidgetSettings(shopResource.shopId)
		res.send({
			settings,
			availableDates: availableDates.map(AvailableDate.toViewModel)
		})
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/widget_settings", [loadConnectedShop], async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new UnexpectedError("`connectedShop` should have been provided")
		}
		const settings = await WidgetService.findOrCreateWidgetSettings(connectedShop.id)
		res.send(settings)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/widget_settings", [loadConnectedShop], async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new UnexpectedError("`connectedShop` should have been provided")
		}
		const widgetSettings = req.body as WidgetSettingsViewModel
		const settings = await WidgetService.updateForShop(connectedShop.id, widgetSettings)
		res.send(settings)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/widget_settings/reset", [loadConnectedShop], async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new UnexpectedError("`connectedShop` should have been provided")
		}
		const settings = await WidgetService.resetSettingsForShop(connectedShop.id)
		res.send(settings)
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
