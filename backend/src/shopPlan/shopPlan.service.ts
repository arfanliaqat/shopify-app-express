import { Pool } from "pg"
import { getConnection } from "../util/database"
import { Plan, planNames, ShopPlan, ShopPlanSchema } from "./shopPlan.model"
import { appUrl, isDev, plans, TRIAL_DAYS } from "../util/constants"
import { handleAxiosErrors, UnexpectedError } from "../util/error"
import axios from "axios"
import { Shop } from "../shop/shop.model"
import { AccessToken } from "../accessToken/accessToken.model"
import crypto from "crypto"
import { ShopService } from "../shop/shop.service"
import { ProductOrderService } from "../productOrders/productOrders.service"

interface RecurringApplicationChargeResponse {
	confirmation_url: string
}

export class ShopPlanService {
	static makeToken(plan: Plan, nonce: string): string {
		const hash = crypto.createHash("sha1")
		hash.update(plan + "_" + nonce)
		return hash.digest("hex")
	}

	static async initiateRecurringCharge(
		shop: Shop,
		plan: Plan,
		nonce: string,
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
			const response = await this.postRecurringApplicationCharge(shop, shopPlan, nonce, accessToken)
			if (!shop.trialUsed) {
				await ShopService.markTrialDaysAsUsed(shop)
			}
			return response
		}
	}

	static async postRecurringApplicationCharge(
		shop: Shop,
		shopPlan: ShopPlan,
		nonce: string,
		accessToken: AccessToken
	): Promise<RecurringApplicationChargeResponse | undefined> {
		const token = this.makeToken(shopPlan.plan, nonce)
		try {
			const response = await axios.post<{ recurring_application_charge: RecurringApplicationChargeResponse }>(
				`https://${shop.domain}/admin/api/2021-01/recurring_application_charges.json`,
				{
					recurring_application_charge: {
						name: planNames[shopPlan.plan],
						price: shopPlan.price,
						trial_days: !shop.trialUsed ? TRIAL_DAYS : 0,
						return_url: `${appUrl}/plan_confirmation?plan=${shopPlan.plan}&token=${token}`,
						test: isDev
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

	static async hasActivePlan(shop: Shop): Promise<boolean> {
		if (!shop.id) throw new UnexpectedError("The shop's id isn't defined")
		const shopPlan = await this.findByShopId(shop.id)
		if (!shopPlan) return false
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

	static async deleteShopPlan(shopPlan: ShopPlan): Promise<void> {
		const conn: Pool = await getConnection()
		await conn.query<ShopPlanSchema>(`DELETE FROM shop_plans WHERE shop_id = $1`, [shopPlan.shopId])
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
}
