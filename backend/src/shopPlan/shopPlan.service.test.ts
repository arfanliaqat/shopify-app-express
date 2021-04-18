import { DatabaseTestService, getConnection } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { Shop } from "../shop/shop.model"
import { ShopPlanService } from "./shopPlan.service"
import { ShopPlanBuilder } from "./shopPlan.builder"
import { ProductOrderBuilder } from "../productOrders/productOrder.builder"
import moment from "moment"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { emailTestStore } from "../notifications/postmark.service"

describe("ShopPlanService", () => {
	let shop: Shop | undefined

	beforeEach(async () => {
		emailTestStore.length = 0 // Clears the array
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

	test("A notification is sent when approaching the plan limit", async () => {
		await new ShopPlanBuilder().forShop(shop!).withOrderLimit(5).buildAndSave()

		// 1. It doesn't send the email if under 80% from plan limit

		const shopResource = await new ShopResourceBuilder()
			.forShop(shop!)
			.withResourceId("Product", 4321)
			.buildAndSave()

		await ShopPlanService.sendPlanLimitNotifications(shop!)

		expect(emailTestStore).toHaveLength(0)

		// 2. Reach 80% to trigger the approaching plan limit email

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const i of Array(4)) {
			await new ProductOrderBuilder()
				.forShopResource(shopResource!)
				.withChosenDate(moment())
				.withCreatedDate(moment())
				.withQuantity(1)
				.buildAndSave()
		}

		await ShopPlanService.sendPlanLimitNotifications(shop!)

		expect(emailTestStore).toHaveLength(1)
		expect(emailTestStore[0].TemplateAlias).toBe("approaching-plan-limit")
		expect((emailTestStore[0].TemplateModel as any)?.order_limit).toBe(5)

		// 3. Email isn't sent twice

		await ShopPlanService.sendPlanLimitNotifications(shop!)

		expect(emailTestStore).toHaveLength(1)
	})

	test("A notification is sent when reaching the plan limit", async () => {
		await new ShopPlanBuilder().forShop(shop!).withOrderLimit(5).buildAndSave()

		// 1. It doesn't send the email if under 80% from plan limit

		const shopResource = await new ShopResourceBuilder()
			.forShop(shop!)
			.withResourceId("Product", 4321)
			.buildAndSave()

		await ShopPlanService.sendPlanLimitNotifications(shop!)

		expect(emailTestStore).toHaveLength(0)

		// 2. Reach 80% to trigger the approaching plan limit email

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const i of Array(5)) {
			await new ProductOrderBuilder()
				.forShopResource(shopResource!)
				.withChosenDate(moment())
				.withCreatedDate(moment())
				.withQuantity(1)
				.buildAndSave()
		}

		await ShopPlanService.sendPlanLimitNotifications(shop!)

		expect(emailTestStore).toHaveLength(1)
		expect(emailTestStore[0].TemplateAlias).toBe("reached-plan-limit")
		expect((emailTestStore[0].TemplateModel as any)?.order_limit).toBe(5)

		// 3. Email isn't sent twice

		await ShopPlanService.sendPlanLimitNotifications(shop!)

		expect(emailTestStore).toHaveLength(1)
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
