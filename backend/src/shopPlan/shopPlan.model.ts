export type Plan = "BASIC" | "PRO" | "UNLIMITED"

export const allPlans: Plan[] = ["BASIC", "PRO", "UNLIMITED"]

export const planNames = {
	BASIC: "Basic Plan",
	PRO: "Pro Plan",
	UNLIMITED: "Unlimited Plan"
}

export interface ShopPlanSchema {
	shop_id: string
	charge_id?: string
	plan: string
	price: string
	order_limit: number
	updated_date?: Date
	created_date?: Date
}

export class ShopPlan {
	constructor(
		public shopId: string,
		public chargeId: number | undefined,
		public plan: Plan,
		public price: number,
		public orderLimit: number,
		public updatedDate?: Date,
		public createdDate?: Date
	) {}

	static createFromSchema(schema: ShopPlanSchema): ShopPlan {
		return new ShopPlan(
			schema.shop_id,
			schema.charge_id ? parseInt(schema.charge_id) : undefined,
			schema.plan as Plan,
			parseFloat(schema.price),
			schema.order_limit,
			schema.updated_date,
			schema.created_date
		)
	}

	static createFromSchemas(schemas: ShopPlanSchema[]): ShopPlan[] {
		return (schemas || []).map(ShopPlan.createFromSchema)
	}
}
