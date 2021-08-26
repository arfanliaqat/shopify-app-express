import { Request, Response, Router } from "express"
import { AxiosCallError, handleErrors, UnexpectedError } from "../util/error"
import { ScriptTagService } from "./scriptTags.service"
import { ShopService } from "../shop/shop.service"
import { AccessTokenService } from "../accessToken/accessToken.service"

const router = Router()

router.get("/get_script_tags_for_shop", async (req: Request, res: Response) => {
	try {
		const shopDomain = req.query.shop
		if (!shopDomain) throw new UnexpectedError("`refresh_script_tag_for_shop` shouldn't be null")
		const shop = await ShopService.findByDomain(shopDomain.toString())
		if (!shop || !shop.id) throw new UnexpectedError("`shop` not found")
		const accessToken = await AccessTokenService.findAccessTokenByShopId(shop.id)
		const scriptTags = await ScriptTagService.fetchAllScriptTags(shop, accessToken)
		res.send(scriptTags)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/delete_script_tags_for_shop", async (req: Request, res: Response) => {
	try {
		const shopDomain = req.query.shop
		if (!shopDomain) throw new UnexpectedError("`refresh_script_tag_for_shop` shouldn't be null")
		const shop = await ShopService.findByDomain(shopDomain.toString())
		if (!shop || !shop.id) throw new UnexpectedError("`shop` not found")
		const accessToken = await AccessTokenService.findAccessTokenByShopId(shop.id)
		await ScriptTagService.deleteAllScriptTags(shop, accessToken)
		res.send("Done.")
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/refresh_script_tag_for_shop", async (req: Request, res: Response) => {
	try {
		const shopDomain = req.query.shop
		if (!shopDomain) throw new UnexpectedError("`refresh_script_tag_for_shop` shouldn't be null")
		const shop = await ShopService.findByDomain(shopDomain.toString())
		if (!shop || !shop.id) throw new UnexpectedError("`shop` not found")
		if (!shop.isActive()) throw new UnexpectedError("The shop must be active")
		const accessToken = await AccessTokenService.findAccessTokenByShopId(shop.id)
		await ScriptTagService.deleteAllScriptTags(shop, accessToken)
		await ScriptTagService.createScriptTags(shop, accessToken, [])
		res.send("Done.")
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/refresh_all_script_tags", async (req: Request, res: Response) => {
	try {
		const activeShops = await ShopService.findAllActiveShops()
		for (const shop of activeShops) {
			if (shop.id) {
				try {
					const accessToken = await AccessTokenService.findAccessTokenByShopId(shop.id)
					await ScriptTagService.deleteAllScriptTags(shop, accessToken)
					await ScriptTagService.createScriptTags(shop, accessToken, [])
				} catch (error) {
					if (error instanceof AxiosCallError) {
						console.log(`[refresh_all_script_tags|shop:${shop.domain}] API error, skipping...`)
					} else {
						throw error
					}
				}
			}
		}
		res.send("Done.")
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
