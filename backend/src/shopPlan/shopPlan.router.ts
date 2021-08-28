import { Request, Response, Router } from "express"
import { loadConnectedShop } from "../shop/shop.middleware"
import { getLocals } from "../util/locals"
import { BadParameter, HandledError, handleErrors, UnexpectedError } from "../util/error"
import { ShopPlanService } from "./shopPlan.service"
import { allPlans, Plan, ShopPlan } from "./shopPlan.model"
import { loadAccessToken } from "../accessToken/accessToken.middleware"
import { devOnly } from "../util/middlewares"
import { ShopService } from "../shop/shop.service"
import { AccessTokenService } from "../accessToken/accessToken.service"
import { shopifyApiPublicKey, shopifyApiSecretKey } from "../util/constants"
import { AssetService } from "../assets/assets.service"

const router = Router()

router.get("/plans_page", [loadConnectedShop], async (req: Request, res: Response) => {
	try {
		const { connectedShop } = getLocals(res)
		if (!connectedShop || !connectedShop.id) {
			throw new HandledError("Missing connectedShop")
		}
		const plan = await ShopPlanService.findByShopId(connectedShop.id)
		res.send({
			trialAlreadyUsed: connectedShop.trialUsed != undefined,
			plan: ShopPlan.toViewModel(plan)
		})
	} catch (error) {
		handleErrors(res, error)
	}
})

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

		const response = await ShopPlanService.initiateRecurringCharge(connectedShop, plan, accessToken)

		res.send(response ? { url: response.confirmation_url } : {})
	} catch (error) {
		handleErrors(res, error)
	}
})

router.get("/plan_confirmation", async (req: Request, res: Response) => {
	try {
		const shopDomain = req.query.shopDomain?.toString()
		if (!shopDomain) throw new BadParameter("Missing 'shopDomain' param")

		const plan = req.query.plan as Plan
		if (!plan) throw new BadParameter("Missing 'plan' parameter")
		if (!allPlans.includes(plan)) throw new BadParameter(`Wrong 'plan' value: ${plan}`)

		const token = req.query.token?.toString()
		if (!token) throw new BadParameter("Missing 'token' param")

		const signature = req.query.signature?.toString()
		if (!signature) throw new BadParameter("Missing 'signature' param")

		if (ShopPlanService.getSignature(shopDomain, plan, token) != signature) {
			throw new BadParameter("Signature mismatch")
		}

		const shop = await ShopService.findByDomain(shopDomain)
		if (!shop || !shop.id) throw new BadParameter("Shop not found")

		const accessToken = await AccessTokenService.findAccessTokenByShopId(shop.id)
		if (!accessToken) throw new BadParameter("Access token not found")

		const chargeId = req.query.charge_id ? parseInt(req.query.charge_id.toString()) : undefined
		if (!chargeId) throw new BadParameter("Missing 'charge_id' parameter")

		await ShopPlanService.createAndSavePlan(shop.id, chargeId, plan as Plan)

		// Update the liquid template
		await AssetService.updateSettingsLiquidTemplate(shop)

		res.redirect(`https://${shop.domain}/admin/apps/${shopifyApiPublicKey}/app?shopOrigin=${shop.domain}`)
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
