import { parse } from "dotenv/types"
import { Request, Response, Router } from "express"
import { fetchShopData } from "../auth/auth.service"
import { loadConnectedShop } from "../shop/shop.middleware"
import { Shop } from "../shop/shop.model"
import { fetchShopifyResources, findShopResources } from "./shopResource.service"
import { parseResourceGid } from "./shopResource.util"

const router = Router()

router.use(loadConnectedShop)

router.get("/resources", async (req: Request, res: Response) => {
	const connectedShop = res.locals.connectedShop as Shop
	const resources = await findShopResources(connectedShop)
	res.send(resources)
})

interface PostResourcesRequestBody {
	resourceIds?: string[]
}

router.post("/resources", async (req: Request, res: Response) => {
	const body = req.body as PostResourcesRequestBody
	if (!body.resourceIds || body.resourceIds.length == 0) {
		res.send({ error: "'resourceIds' is missing or empty" })
		return
	}

	const shop = res.locals.shop as Shop
	const shopifyResources = await fetchShopifyResources(shop, body.resourceIds)

	// TODO:
	// await createShopResource(shopifyResources)
})

export default router
