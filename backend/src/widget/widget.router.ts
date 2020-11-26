import { Request, Response, Router } from "express"
import { findFutureAvailableDates } from "../deliverySlots/deliverySlots.service"
import { findShopResourceIdByProductId } from "../shopResource/shopResource.service"
import { handleErrors } from "../util/error"

const router = Router()

router.get("/product_availability/:productId", async (req: Request, res: Response) => {
	try {
		const productId = parseInt(req.params.productId)
		const shopResourceId = await findShopResourceIdByProductId(productId)
		if (!shopResourceId) {
			res.status(404).send({ reason: "Resource not found" })
			return
		}
		const availableDates = await findFutureAvailableDates(shopResourceId)
		res.send({ availableDates: availableDates.map((date) => date.format("YYYY-MM-DD")) })
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router