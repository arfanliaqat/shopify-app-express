import { Router } from "express"
import { Request, Response } from "express"
import querystring from "querystring"
import { handleErrors } from "../util/error"
import { AuthService } from "./auth.service"
import { HooksService } from "../hooks/hooks.service"
import { ScriptTagService } from "../scriptTags/scriptTags.service"

const router = Router()

router.get("/auth", (req: Request, res: Response) => {
	try {
		const shop = req.query.shop
		if (!shop) {
			return res.status(400).send("Shop is missing")
		}

		const installShopUrl = AuthService.buildInstallUrl(shop.toString(), AuthService.buildRedirectUri())

		// Stupid hack to make it works on Safari
		res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store")
		res.send(`<script>window.location.href = "${installShopUrl}"</script>`)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/auth/callback", async (req: Request, res: Response) => {
	try {
		const { shop, code } = req.query
		if (!shop) return res.status(400).send("Missing 'shop' in the query params")
		if (!code) return res.status(400).send("Missing 'code' in the query params")

		const { hmac, ...params } = req.query
		const queryParams = querystring.stringify(params as any)
		const hash = AuthService.generateEncryptedHash(queryParams)

		if (hash !== hmac) {
			return res.status(400).send("HMAC validation failed")
		}

		const [dbShop, accessToken] = await AuthService.findShopOrInstallApp(shop.toString(), code.toString())
		if (!dbShop || !dbShop.id) {
			throw "Missing 'dbShop' or 'dbShop.id'"
		}
		await HooksService.subscribeHooks(dbShop, accessToken)
		await ScriptTagService.createScriptTags(dbShop, accessToken)
		res.redirect("/app?shopOrigin=" + dbShop.domain)
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
