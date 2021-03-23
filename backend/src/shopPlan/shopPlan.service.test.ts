import { DatabaseTestService, getConnection } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { Shop } from "../shop/shop.model"
import { ShopPlanService } from "./shopPlan.service"
import { ShopPlanBuilder } from "./shopPlan.builder"
import { ProductOrderBuilder } from "../productOrders/productOrder.builder"
import moment from "moment"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"

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
			expect(shopPlan?.price).toBe(0)
			expect(shopPlan?.orderLimit).toBe(25)
		}
		{
			// Upgrade to PRO plan
			await ShopPlanService.createAndSavePlan(shop!.id!, 123, "PRO")
			const shopPlan = await ShopPlanService.findByShopId(shop!.id!)
			expect(shopPlan).toBeDefined()
			expect(shopPlan?.chargeId).toBe(123)
			expect(shopPlan?.plan).toBe("PRO")
			expect(shopPlan?.price).toBe(5)
			expect(shopPlan?.orderLimit).toBe(150)
		}
	})

	test("Check if the shop has an active plan", async () => {
		{
			const isActive = await ShopPlanService.hasActivePlan(shop!)
			expect(isActive).toBeFalsy()
		}

		await new ShopPlanBuilder().forShop(shop!).withOrderLimit(2).buildAndSave()

		{
			const isActive = await ShopPlanService.hasActivePlan(shop!)
			expect(isActive).toBeTruthy()
		}

		const refDate = moment().startOf("month")

		const shopResource = await new ShopResourceBuilder()
			.forShop(shop!)
			.withResourceId("Product", 4321)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withChosenDate(refDate)
			.withCreatedDate(refDate)
			.withQuantity(1)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withChosenDate(refDate.clone().add(1, "day"))
			.withCreatedDate(refDate.clone().add(1, "day"))
			.withQuantity(2)
			.buildAndSave()

		{
			// It's reached the limit for this month: 2 orders
			const isActive = await ShopPlanService.hasActivePlan(shop!)
			expect(isActive).toBeFalsy()
		}
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
