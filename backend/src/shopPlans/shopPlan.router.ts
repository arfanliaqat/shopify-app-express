import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { loadShopResource } from "../shopResource/shopResource.middleware"
import { getLocals } from "../util/locals"
import { BadParameter, HandledError, handleErrors, UnexpectedError } from "../util/error"
import { getSession, updateSession } from "../util/session"
import { ShopPlanService } from "./shopPlan.service"
import { allPlans, Plan } from "./shopPlan.model"
import { generateNonce } from "../util/tools"

const router = Router()

router.post("/choose_plan", [loadConnectedShop, loadShopResource], async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new HandledError("Missing connectedShop")
		}

		const plan = req.body.plan as Plan
		if (!allPlans.includes(plan as Plan)) {
			throw new BadParameter(`Wrong 'plan' value: ${plan}`)
		}

		const nonce = generateNonce(16)
		updateSession(req, res, { planToken: nonce })
		const response = await ShopPlanService.initiateRecurringCharge(connectedShop, plan, nonce)
		if (!response) {
			throw new UnexpectedError("Something went wrong when initiating the recurring charge")
		}

		res.send({
			url: response.confirmation_url
		})
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/plan_confirmation", [loadConnectedShop, loadShopResource], async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new HandledError("Missing connectedShop")
		}

		const { token: urlToken, plan } = req.query
		if (!urlToken) {
			throw new BadParameter("Missing 'token' parameter")
		}

		if (!plan) {
			throw new BadParameter("Missing 'plan' parameter")
		}
		if (!allPlans.includes(plan as Plan)) {
			throw new BadParameter(`Wrong 'plan' value: ${plan}`)
		}

		const { planToken: sessionToken } = getSession(req)
		if (!sessionToken) {
			throw new BadParameter("Missing 'planToken' in the session")
		}
		if (urlToken != sessionToken) {
			throw new BadParameter("'token' mismatch")
		}

		updateSession(req, res, { planToken: undefined })

		await ShopPlanService.createAndSavePlan(connectedShop.id, plan as Plan)

		res.redirect("/app")
	} catch (error) {
		handleErrors(res, error)
	}
})

export default router
