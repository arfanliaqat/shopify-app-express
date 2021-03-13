import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { getLocals } from "../util/locals"
import { BadParameter, HandledError, handleErrors, UnexpectedError } from "../util/error"
import { getSession, updateSession } from "../util/session"
import { ShopPlanService } from "./shopPlan.service"
import { allPlans, Plan } from "./shopPlan.model"
import { generateNonce } from "../util/tools"
import { loadAccessToken } from "../accessToken/accessToken.middleware"
import { devOnly } from "../util/middlewares"

const router = Router()

router.post("/choose_plan", [loadConnectedShop, loadAccessToken], async (req: Request, res: Response) => {
	try {
		const { connectedShop, accessToken } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new HandledError("Missing connectedShop")
		}
		if (!accessToken) {
			throw new HandledError("Missing access token")
		}

		const plan = req.body.plan as Plan
		if (!allPlans.includes(plan as Plan)) {
			throw new BadParameter(`Wrong 'plan' value: ${plan}`)
		}

		const nonce = generateNonce(16)
		updateSession(req, res, { planToken: nonce })
		const response = await ShopPlanService.initiateRecurringCharge(connectedShop, plan, nonce, accessToken)
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

router.get("/plan_confirmation", [loadConnectedShop, loadAccessToken], async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new HandledError("Missing connectedShop")
		}

		const urlToken = req.query.token
		if (!urlToken) {
			throw new BadParameter("Missing 'token' parameter")
		}

		const plan = req.query.plan as Plan
		if (!plan) {
			throw new BadParameter("Missing 'plan' parameter")
		}
		if (!allPlans.includes(plan)) {
			throw new BadParameter(`Wrong 'plan' value: ${plan}`)
		}

		const { planToken: sessionToken } = getSession(req)
		if (!sessionToken) {
			throw new BadParameter("Missing 'planToken' in the session")
		}
		if (urlToken != ShopPlanService.makeToken(plan, sessionToken)) {
			throw new BadParameter("'token' mismatch")
		}

		const chargeId = req.query.charge_id ? parseInt(req.query.charge_id.toString()) : undefined
		if (!chargeId) {
			throw new BadParameter("Missing 'charge_id' parameter")
		}

		updateSession(req, res, { planToken: undefined })

		await ShopPlanService.createAndSavePlan(connectedShop.id, chargeId, plan as Plan)

		res.redirect("/app")
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get(
	"/recurring_application_charges",
	[devOnly, loadConnectedShop, loadAccessToken],
	async (req: Request, res: Response) => {
		try {
			const { connectedShop, accessToken } = getLocals(res)
			if (!connectedShop) throw new UnexpectedError("`connectedShop` shouldn't be null")
			if (!accessToken) throw new UnexpectedError("`accessToken` shouldn't be null")
			const hooks = await ShopPlanService.fetchRecurringApplicationCharges(connectedShop, accessToken)
			res.send(hooks)
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
