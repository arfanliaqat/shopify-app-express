import { DatabaseTestService } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { Shop } from "../shop/shop.model"
import { ShopPlanService } from "./shopPlan.service"

describe("ShopPlanService", () => {
	let shop: Shop | undefined

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		shop = await new ShopBuilder().buildAndSave()
	})

	test("Plans can be created and upgraded", async () => {
		{
			// Set BASIC plan
			await ShopPlanService.createAndSavePlan(shop!.id!, 123, "BASIC")
			const shopPlan = await ShopPlanService.findByShopId(shop!.id!)
			expect(shopPlan).toBeDefined()
			expect(shopPlan?.chargeId).toBe(123)
			expect(shopPlan?.plan).toBe("BASIC")
			expect(shopPlan?.price).toBe(5)
			expect(shopPlan?.orderLimit).toBe(100)
		}
		{
			// Upgrade to PRO plan
			await ShopPlanService.createAndSavePlan(shop!.id!, 123, "PRO")
			const shopPlan = await ShopPlanService.findByShopId(shop!.id!)
			expect(shopPlan).toBeDefined()
			expect(shopPlan?.chargeId).toBe(123)
			expect(shopPlan?.plan).toBe("PRO")
			expect(shopPlan?.price).toBe(10)
			expect(shopPlan?.orderLimit).toBe(1000)
		}
	})

	test("Check if the shop has an active plan", async () => {
		{
			const isActive = await ShopPlanService.hasActivePlan(shop!.id!)
			expect(isActive).toBeFalsy()
		}
		await ShopPlanService.createAndSavePlan(shop!.id!, 123, "BASIC")
		{
			const isActive = await ShopPlanService.hasActivePlan(shop!.id!)
			expect(isActive).toBeTruthy()
		}
	})
})
