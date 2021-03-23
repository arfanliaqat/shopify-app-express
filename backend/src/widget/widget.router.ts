import { Request, Response, Router } from "express"
import { AvailabilityPeriodService } from "../availabilityPeriods/availabilityPeriods.service"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { handleErrors, UnexpectedError } from "../util/error"
import { AvailableDate } from "../availabilityPeriods/availabilityPeriods.model"
import { WidgetService } from "./widget.service"
import { loadConnectedShop } from "../shop/shop.middleware"
import { getLocals } from "../util/locals"
import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import { WidgetSettings } from "./widget.model"
import { ShopPlanService } from "../shopPlan/shopPlan.service"
import { ShopPlan } from "../shopPlan/shopPlan.model"
import { ProductOrderService } from "../productOrders/productOrders.service"
import { ShopService } from "../shop/shop.service"

const router = Router()

router.get("/settings", async (req: Request, res: Response) => {
	try {
		const shopDomain = req.query.shop?.toString()
		if (!shopDomain) {
			res.status(404).send({ reason: "'shop' param missing" })
			return
		}
		const shop = await ShopService.findByDomain(shopDomain)
		if (!shop?.id) {
			res.status(404).send({ reason: "No matching shop found" })
			return
		}
		const planIsActive = await ShopPlanService.hasActivePlan(shop)
		if (!planIsActive) {
			res.status(403).send({ reason: "The plan's limit has been reached. Please upgrade your plan." })
			return
		}
		const widgetSettings = await WidgetService.findWidgetSettingsByShopId(shop.id)
		if (!widgetSettings) {
			res.status(404).send({ reason: "Widget settings not found" })
			return
		}
		res.send(widgetSettings)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/product_availability/:productId", async (req: Request, res: Response) => {
	try {
		const productId = parseInt(req.params.productId)
		const shopResource = await ShopResourceService.findShopResourceByProductId(productId)
		if (!shopResource || !shopResource.id) {
			res.status(404).send({ reason: "Resource not found" })
			return
		}
		let widgetSettings = await WidgetService.findWidgetSettingsByShopId(shopResource.shopId)
		if (!widgetSettings) {
			widgetSettings = WidgetSettings.getDefault(shopResource.shopId).settings
		}
		const availableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource.id, widgetSettings)
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
		const plan = await ShopPlanService.findByShopId(connectedShop.id)
		const currentOrderCount = await ProductOrderService.countOrdersInCurrentMonth(connectedShop)
		res.send({ currentOrderCount, plan: ShopPlan.toViewModel(plan), settings })
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
