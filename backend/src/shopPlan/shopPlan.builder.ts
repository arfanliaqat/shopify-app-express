import { Plan, ShopPlan } from "./shopPlan.model"
import { Shop } from "../shop/shop.model"
import { ShopPlanService } from "./shopPlan.service"

export class ShopPlanBuilder {
	private shopId?: string
	private chargeId?: number
	private plan?: Plan
	private price?: number
	private orderLimit?: number

	forShop(shop: Shop): this {
		this.shopId = shop.id!
		return this
	}

	withChargeId(chargeId: number): this {
		this.chargeId = chargeId
		return this
	}

	withPlan(plan: Plan): this {
		this.plan = plan
		return this
	}

	withPrice(price: number): this {
		this.price = price
		return this
	}

	withOrderLimit(orderLimit: number): this {
		this.orderLimit = orderLimit
		return this
	}

	async buildAndSave(): Promise<ShopPlan | undefined> {
		if (!this.shopId) throw "this.shopId is required"
		return await ShopPlanService.upsert(
			new ShopPlan(this.shopId, this.chargeId, this.plan ?? "PRO", this.price ?? 5, this.orderLimit ?? 150)
		)
	}
}
