import { Plan } from "../../../backend/src/shopPlan/shopPlan.model"

export default interface ShopPlan {
	plan: Plan
	price: number
	orderLimit: number
}
