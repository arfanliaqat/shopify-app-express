import { Pool } from "pg"
import { getConnection } from "../util/database"
import { Plan, planNames, ShopPlan, ShopPlanSchema } from "./shopPlan.model"
import { appUrl, isChargeTestMode, plans, shopifyApiSecretKey, TRIAL_DAYS } from "../util/constants"
import { handleAxiosErrors, UnexpectedError } from "../util/error"
import axios from "axios"
import { Shop } from "../shop/shop.model"
import { AccessToken } from "../accessToken/accessToken.model"
import crypto from "crypto"
import { ShopService } from "../shop/shop.service"
import { ProductOrderService } from "../productOrders/productOrders.service"
import moment from "moment"
import NotificationService from "../notifications/notifications.service"
import { generateNonce } from "../util/tools"
import { AssetService } from "../assets/assets.service"
import { templateSettings } from "lodash"

interface RecurringApplicationChargeResponse {
	confirmation_url: string
	price: string
}

export class ShopPlanService {
	static async initiateRecurringCharge(
		shop: Shop,
		plan: Plan,
		accessToken: AccessToken
	): Promise<RecurringApplicationChargeResponse | undefined> {
		if (!shop.id) throw new UnexpectedError("Shop id cannot be undefined")
		const existingShopPlan = await this.findByShopId(shop.id)
		const isFreePlan = plans[plan].price === 0
		const shopPlan = this.createPlan(shop.id, undefined, plan)
		if (isFreePlan) {
			if (existingShopPlan?.chargeId) {
				await this.deleteRecurringApplicationCharge(shop, existingShopPlan, accessToken)
			}
			await this.upsert(shopPlan) // Update the shop plan record straightaway, no confirmation step
		} else {
			const response = await this.postRecurringApplicationCharge(shop, shopPlan, accessToken)
			if (!shop.trialUsed) {
				await ShopService.markTrialDaysAsUsed(shop)
			}
			return response
		}
	}

	static getSignature(shopDomain: string, plan: Plan, token: string): string {
		const hash = crypto.createHash("sha256")
		hash.update(plan + "_" + shopDomain + "_" + token + "_" + shopifyApiSecretKey)
		return hash.digest("hex")
	}

	static getTrialDays(shop: Shop): number {
		let daysSinceTrialStarted = 0
		if (shop.trialUsed) {
			// When reinstalling the app we want to resume the trial where it was left off
			const trialStartDate = moment(shop.trialUsed).startOf("day")
			const today = moment().startOf("day")
			daysSinceTrialStarted = Math.abs(today.diff(trialStartDate, "days"))
		}
		return Math.max(TRIAL_DAYS - daysSinceTrialStarted, 0)
	}

	static async postRecurringApplicationCharge(
		shop: Shop,
		shopPlan: ShopPlan,
		accessToken: AccessToken
	): Promise<RecurringApplicationChargeResponse | undefined> {
		try {
			const token = generateNonce(16)
			const signature = this.getSignature(shop.domain, shopPlan.plan, token)
			const returnUrlQuery = `plan=${shopPlan.plan}&shopDomain=${shop.domain}&token=${token}&signature=${signature}`
			const returnUrl = `${appUrl}/plan_confirmation?${returnUrlQuery}`
			const response = await axios.post<{ recurring_application_charge: RecurringApplicationChargeResponse }>(
				`https://${shop.domain}/admin/api/2021-01/recurring_application_charges.json`,
				{
					recurring_application_charge: {
						name: planNames[shopPlan.plan],
						price: shopPlan.price,
						trial_days: this.getTrialDays(shop),
						return_url: returnUrl,
						test: shop.isTestShop() || isChargeTestMode
					}
				},
				{
					headers: {
						"Content-Type": "application/json",
						"X-Shopify-Access-Token": accessToken.token
					}
				}
			)
			return response.data.recurring_application_charge
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async deleteRecurringApplicationCharge(
		shop: Shop,
		shopPlan: ShopPlan,
		accessToken: AccessToken
	): Promise<void> {
		try {
			await axios.delete(
				`https://${shop.domain}/admin/api/2021-01/recurring_application_charges/${shopPlan.chargeId}.json`,
				{
					headers: {
						"Content-Type": "application/json",
						"X-Shopify-Access-Token": accessToken.token
					}
				}
			)
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async fetchRecurringApplicationCharges(shop: Shop, accessToken: AccessToken) {
		try {
			const response = await axios.get<RecurringApplicationChargeResponse>(
				`https://${shop.domain}/admin/api/2021-01/recurring_application_charges.json`,
				{
					headers: {
						"X-Shopify-Access-Token": accessToken.token
					}
				}
			)
			return response.data
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async hasActivePlan(shop: Shop): Promise<boolean> {
		if (!shop.id) throw new UnexpectedError("The shop's id isn't defined")
		const shopPlan = await this.findByShopId(shop.id)
		if (!shopPlan) return false
		if (shopPlan.orderLimit == -1) return true
		const currentOrderCount = await ProductOrderService.countOrdersInCurrentMonth(shop)
		return currentOrderCount < shopPlan.orderLimit
	}

	static createPlan(shopId: string, chargeId: number | undefined, plan: Plan): ShopPlan {
		const planConfiguration = plans[plan]
		if (!planConfiguration) throw new UnexpectedError(`Plan configuration not found: ${plan}`)
		return new ShopPlan(shopId, chargeId, plan, planConfiguration.price, planConfiguration.orderLimit)
	}

	static async createAndSavePlan(shopId: string, chargeId: number, plan: Plan): Promise<ShopPlan> {
		const planConfiguration = plans[plan]
		if (!planConfiguration) throw new UnexpectedError(`Plan configuration not found: ${plan}`)
		const shopPlan = new ShopPlan(shopId, chargeId, plan, planConfiguration.price, planConfiguration.orderLimit)
		await this.upsert(shopPlan)
		return shopPlan
	}

	static async findByShopId(shopId: string): Promise<ShopPlan | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopPlanSchema>(
			`
			SELECT shop_id, charge_id, plan, price, order_limit
			FROM shop_plans
			WHERE shop_id = $1`,
			[shopId]
		)
		return ShopPlan.createFromSchemas(result.rows)[0]
	}

	static async upsert(shopPlan: ShopPlan): Promise<ShopPlan | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopPlanSchema>(
			`
			INSERT INTO shop_plans (shop_id, charge_id, plan, price, order_limit)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (shop_id) DO UPDATE SET charge_id = $2, plan = $3, price = $4, order_limit = $5 
			RETURNING shop_id, plan, price, order_limit`,
			[shopPlan.shopId, shopPlan.chargeId, shopPlan.plan, shopPlan.price, shopPlan.orderLimit]
		)
		return ShopPlan.createFromSchemas(result.rows)[0]
	}

	static async deleteShopPlan(shop: Shop): Promise<void> {
		if (!shop.id) throw new UnexpectedError("The shop's id isn't defined")
		const conn: Pool = await getConnection()
		await conn.query<ShopPlanSchema>(`DELETE FROM shop_plans WHERE shop_id = $1`, [shop.id])
	}

	static async checkPlanLimit(shop: Shop): Promise<void> {
		if (!shop.id) throw new UnexpectedError("The shop's id isn't defined")
		const shopPlan = await this.findByShopId(shop.id)
		const monthStart = moment().startOf("month")
		const monthEnd = moment().endOf("month")
		if (shopPlan && shopPlan.orderLimit > 0) {
			const currentOrderCount = await ProductOrderService.countOrdersInMonth(shop, moment())
			const progressPercent = (currentOrderCount * 100) / shopPlan.orderLimit
			const approachingLimit = progressPercent >= 80
			const reachedLimit = currentOrderCount >= shopPlan.orderLimit
			if (reachedLimit) {
				const notifications = await NotificationService.findNotifications(
					shop,
					"REACHED_PLAN_LIMIT",
					monthStart,
					monthEnd
				)
				if (notifications.length == 0) {
					await NotificationService.reachedPlanLimit(shop, shopPlan)
				}
				// Update the asset to disable the date picker
				await AssetService.updateSettingsLiquidTemplate(shop)
			} else if (approachingLimit) {
				const notifications = await NotificationService.findNotifications(
					shop,
					"APPROACHING_PLAN_LIMIT",
					monthStart,
					monthEnd
				)
				if (notifications.length == 0) {
					await NotificationService.approachingPlanLimit(shop, shopPlan)
				}
			}
		}
	}
}
