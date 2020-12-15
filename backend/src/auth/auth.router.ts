import { Router } from "express"
import { Request, Response } from "express"
import querystring from "querystring"
import { handleErrors } from "../util/error"
import { getSession, updateSession } from "../util/session"
import { generateNonce } from "../util/tools"
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
		const nonce = generateNonce(16)
		const installShopUrl = AuthService.buildInstallUrl(shop.toString(), nonce, AuthService.buildRedirectUri())
		updateSession(req, res, { state: nonce })
		res.redirect(installShopUrl)
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/auth/callback", async (req: Request, res: Response) => {
	try {
		const { shop, code, state } = req.query
		if (!shop) return res.status(400).send("Missing 'shop' in the query params")
		if (!state) return res.status(400).send("Missing 'state' in the query params")
		if (!code) return res.status(400).send("Missing 'code' in the query params")

		const sessionState = getSession(req).state
		if (!sessionState) return res.status(400).send("Missing 'state' in the session")
		if (state.toString() != sessionState) return res.status(403).send("Cannot be verified")

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
		updateSession(req, res, { shopId: dbShop.id, state: undefined })
		res.redirect("/app")
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
