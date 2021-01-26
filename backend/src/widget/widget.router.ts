import { Request, Response, Router } from "express"
import { AvailabilityPeriodService } from "../availabilityPeriods/availabilityPeriods.service"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { handleErrors } from "../util/error"
import { AvailableDate } from "../availabilityPeriods/availabilityPeriods.model"
import { WidgetService } from "./widget.service"

const router = Router()

router.get("/product_availability/:productId", async (req: Request, res: Response) => {
	try {
		const productId = parseInt(req.params.productId)
		const shopResourceId = await ShopResourceService.findShopResourceIdByProductId(productId)
		if (!shopResourceId) {
			res.status(404).send({ reason: "Resource not found" })
			return
		}
		const availableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResourceId)
		const settings = WidgetService.findWidgetSettings()
		res.send({
			settings,
			availableDates: availableDates.map(AvailableDate.toViewModel)
		})
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
