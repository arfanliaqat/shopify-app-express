import { Request, Response, Router } from "express"
import { DeliverySlotService } from "../deliverySlots/deliverySlots.service"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { handleErrors } from "../util/error"

const router = Router()

router.get("/product_availability/:productId", async (req: Request, res: Response) => {
	try {
		const productId = parseInt(req.params.productId)
		const shopResourceId = await ShopResourceService.findShopResourceIdByProductId(productId)
		if (!shopResourceId) {
			res.status(404).send({ reason: "Resource not found" })
			return
		}
		const availableDates = await DeliverySlotService.findFutureAvailableDates(shopResourceId)
		res.send({ availableDates: availableDates.map((availableDate) => availableDate.date.format("YYYY-MM-DD")) })
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
