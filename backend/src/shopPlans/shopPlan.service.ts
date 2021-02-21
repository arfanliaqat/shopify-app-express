import { Pool } from "pg"
import { getConnection } from "../util/database"
import { Plan, ShopPlan, ShopPlanSchema } from "./shopPlan.model"
import { plans } from "../util/constants"
import { UnexpectedError } from "../util/error"

export class ShopPlanService {
	static async hasActivePlan(shopId: string): Promise<boolean> {
		const shopPlan = await this.findByShopId(shopId)
		// TODO: check that it has not reached the limit
		return !!shopPlan
	}

	static async createPlan(shopId: string, plan: Plan): Promise<ShopPlan | undefined> {
		const planConfiguration = plans[plan]
		if (!planConfiguration) throw new UnexpectedError(`Plan configuration not found: ${plan}`)
		const shopPlan = new ShopPlan(shopId, plan, planConfiguration.price, planConfiguration.orderLimit)
		return await this.upsert(shopPlan)
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
