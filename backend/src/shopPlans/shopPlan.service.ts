import { Pool } from "pg"
import { getConnection } from "../util/database"
import { Plan, planNames, ShopPlan, ShopPlanSchema } from "./shopPlan.model"
import { appUrl, isDev, plans } from "../util/constants"
import { handleAxiosErrors, UnexpectedError } from "../util/error"
import axios from "axios"
import { Shop } from "../shop/shop.model"

interface RecurringApplicationChargeResponse {
	confirmation_url: string
}

export class ShopPlanService {
	static async initiateRecurringCharge(
		shop: Shop,
		plan: Plan,
		nonce: string
	): Promise<RecurringApplicationChargeResponse | undefined> {
		if (!shop.id) throw new UnexpectedError("Shop id cannot be undefined")
		const isNewCustomer = !!(await this.findByShopId(shop.id))
		const shopPlan = this.createPlan(shop.id, plan)
		return await this.postRecurringApplicationCharge(shop, shopPlan, nonce, isNewCustomer)
	}

	static async postRecurringApplicationCharge(
		shop: Shop,
		shopPlan: ShopPlan,
		nonce: string,
		isNewCustomer: boolean
	): Promise<RecurringApplicationChargeResponse | undefined> {
		try {
			const response = await axios.post<RecurringApplicationChargeResponse>(
				`https://${shop.domain}/admin/api/2021-01/recurring_application_charges.json`,
				{
					recurring_application_charge: {
						name: planNames[shopPlan.plan],
						price: shopPlan.price,
						trial_days: isNewCustomer ? 7 : 0,
						return_url: appUrl + "/plan_confirmation?token=" + nonce,
						test: isDev
					}
				}
			)
			return response.data
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async hasActivePlan(shopId: string): Promise<boolean> {
		const shopPlan = await this.findByShopId(shopId)
		// TODO: check that it has not reached the limit
		return !!shopPlan
	}

	static createPlan(shopId: string, plan: Plan): ShopPlan {
		const planConfiguration = plans[plan]
		if (!planConfiguration) throw new UnexpectedError(`Plan configuration not found: ${plan}`)
		return new ShopPlan(shopId, plan, planConfiguration.price, planConfiguration.orderLimit)
	}

	static async createAndSavePlan(shopId: string, plan: Plan): Promise<ShopPlan> {
		const planConfiguration = plans[plan]
		if (!planConfiguration) throw new UnexpectedError(`Plan configuration not found: ${plan}`)
		const shopPlan = new ShopPlan(shopId, plan, planConfiguration.price, planConfiguration.orderLimit)
		await this.upsert(shopPlan)
		return shopPlan
	}

	static async findByShopId(shopId: string): Promise<ShopPlan | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopPlanSchema>(
			`
			SELECT shop_id, plan, price, order_limit
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
			INSERT INTO shop_plans (shop_id, plan, price, order_limit)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (shop_id) DO UPDATE SET plan = $2, price = $3, order_limit = $4 
			RETURNING shop_id, plan, price, order_limit`,
			[shopPlan.shopId, shopPlan.plan, shopPlan.price, shopPlan.orderLimit]
		)
		return ShopPlan.createFromSchemas(result.rows)[0]
	}
}
