import { devOnly } from "../util/middlewares"
import { Request, Response, Router } from "express"
import { handleErrors, UnexpectedError } from "../util/error"
import { getLocals } from "../util/locals"
import { ScriptTagService } from "./scriptTags.service"
import { loadConnectedShop } from "../shop/shop.middleware"
import { loadAccessToken } from "../accessToken/accessToken.middleware"

const router = Router()

router.get(
	"/delete_all_script_tags",
	[devOnly, loadConnectedShop, loadAccessToken],
	async (req: Request, res: Response) => {
		try {
			const { connectedShop, accessToken } = getLocals(res)
			if (!connectedShop) throw new UnexpectedError("`connectedShop` shouldn't be null")
			if (!accessToken) throw new UnexpectedError("`accessToken` shouldn't be null")
			await ScriptTagService.deleteAllScriptTags(connectedShop, accessToken)
			res.send("Done.")
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

router.get(
	"/get_all_script_tags",
	[devOnly, loadConnectedShop, loadAccessToken],
	async (req: Request, res: Response) => {
		try {
			console.log("123123")
			const { connectedShop, accessToken } = getLocals(res)
			if (!connectedShop) throw new UnexpectedError("`connectedShop` shouldn't be null")
			if (!accessToken) throw new UnexpectedError("`accessToken` shouldn't be null")
			const scriptTags = await ScriptTagService.fetchAllScriptTags(connectedShop, accessToken)
			res.send(scriptTags)
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
