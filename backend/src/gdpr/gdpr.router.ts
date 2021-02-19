import { authenticateHook, loadHookContext } from "../hooks/hooks.middleware"
import { raw, Request, Response, Router } from "express"
import { handleErrors } from "../util/error"
import { GdprPayload, GdprRequestType } from "./gdpr.model"
import { GdprService } from "./gdpr.service"

const router = Router()

router.use("/gdpr", raw({ type: "application/json" }))

router.post("/gdpr/customers/redact", [loadHookContext, authenticateHook], async (req: Request, res: Response) => {
	try {
		console.log(req.body)
		const payload = JSON.parse(req.body) as GdprPayload
		await GdprService.logGdprRequest(GdprRequestType.CUSTOMER_REDACT, payload)
		res.end()
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post("/gdpr/shop/redact", [loadHookContext, authenticateHook], async (req: Request, res: Response) => {
	try {
		const payload = JSON.parse(req.body) as GdprPayload
		await GdprService.logGdprRequest(GdprRequestType.SHOP_REDACT, payload)
		res.end()
	} catch (error) {
		handleErrors(res, error)
	}
})

router.post(
	"/gdpr/customers/data_request",
	[loadHookContext, authenticateHook],
	async (req: Request, res: Response) => {
		try {
			const payload = JSON.parse(req.body) as GdprPayload
			await GdprService.logGdprRequest(GdprRequestType.CUSTOMERS_DATA_REQUEST, payload)
			res.end()
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
