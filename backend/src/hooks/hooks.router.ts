import { Request, Response, Router, raw } from "express"
import { handleErrors, UnexpectedError } from "../util/error"
import { authenticateHook, loadHookContext, loadConnectedShop } from "./hooks.middleware"
import { OrderEventData, OrderEventType } from "./hooks.model"
import { HooksService } from "./hooks.service"
import { getLocals } from "../util/locals"

const router = Router()

router.use("/hooks", raw({ type: "application/json" }))

router.post(
	"/hooks/orders/:eventType",
	[loadHookContext, authenticateHook, loadConnectedShop],
	async (req: Request, res: Response) => {
		try {
			console.log(JSON.parse(req.body))
			const eventType = req.params.eventType as OrderEventType
			const { connectedShop } = getLocals(res)
			if (!connectedShop) {
				throw new UnexpectedError("`connectedShop` shouldn't be null")
			}
			const orderEvent = JSON.parse(req.body) as OrderEventData
			await HooksService.ingestOrderEvent(eventType, connectedShop, orderEvent)

			res.end()
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
