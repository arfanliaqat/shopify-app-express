import { Request, Response, Router } from "express"
import { loadAccessToken } from "../accessToken/accessToken.middleware"
import { loadConnectedShop } from "../shop/shop.middleware"
import { Shop } from "../shop/shop.model"
import { handleErrors, UnexpectedError } from "../util/error"
import { getLocals } from "../util/locals"
import { ShopResourceService } from "./shopResource.service"

const router = Router()

router.get("/resources", [loadConnectedShop, loadAccessToken], async (req: Request, res: Response) => {
	try {
		const connectedShop = res.locals.connectedShop as Shop
		const page = parseInt(req.query.page?.toString() || "0")
		const results = await ShopResourceService.searchShopResources(connectedShop, { page })
		res.send(results)
	} catch (error) {
		handleErrors(res, error)
	}
})

interface PostResourcesRequestBody {
	resourceIds?: string[]
}

router.post("/resources", [loadConnectedShop, loadAccessToken], async (req: Request, res: Response) => {
	try {
		const body = req.body as PostResourcesRequestBody
		if (!body.resourceIds || body.resourceIds.length == 0) {
			res.send({ error: "'resourceIds' is missing or empty" })
			return
		}
		const { connectedShop, accessToken } = getLocals(res)
		if (!connectedShop || !accessToken) {
			throw new UnexpectedError("`connectedShop` and `accessToken` should have been provided")
		}
		await ShopResourceService.createShopifyResources(connectedShop, accessToken, body.resourceIds)
		res.end()
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
