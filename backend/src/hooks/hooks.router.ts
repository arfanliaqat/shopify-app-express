import { Request, Response, Router, raw } from "express"
import { handleErrors } from "../util/error"
import { authenticateHook, loadHookContext, loadConnectedShop } from "./hooks.middleware"

const router = Router()

router.use("/hooks", raw({ type: "application/json" }))

router.post("/hooks/orders", [loadHookContext, authenticateHook, loadConnectedShop], (req: Request, res: Response) => {
	try {
		console.log(JSON.parse(req.body))
		res.end()
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
