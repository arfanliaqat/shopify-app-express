import moment, { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { DatabaseTestService, getConnection } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { DeliverySlotBuilder } from "./deliverySlots.builder"
import { DeliverySlotService } from "./deliverySlots.service"
import { ProductOrderBuilder } from "../productOrders/productOrder.builder"

describe("DeliverySlotService", () => {
	let refDate: Moment
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined
	let deliveryDate1: Moment | undefined
	let deliveryDate2: Moment | undefined

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		refDate = moment().startOf("day").startOf("week").add(1, "week")
		shop = await new ShopBuilder().buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()
		deliveryDate1 = refDate
		deliveryDate2 = refDate.clone().add(1, "day")

		await new DeliverySlotBuilder()
			.forShopResource(shopResource!)
			.withDates([deliveryDate1, deliveryDate2])
			.withQuantity(5)
			.buildAndSave()
	})

	test("It retrieves future available dates for a given product", async () => {
		const futureAvailableDates = await DeliverySlotService.findFutureAvailableDates(shopResource!.id!)
		expect(futureAvailableDates).toHaveLength(2)
		expect(futureAvailableDates[0].date.isSame(deliveryDate1)).toBeTruthy()
		expect(futureAvailableDates[1].date.isSame(deliveryDate2)).toBeTruthy()
	})

	test("It indicates when the date is sold out", async () => {
		const deliveryDate3 = refDate.clone().add(3, "week")

		// Add one more delivery slot to make the test scenario more complete
		await new DeliverySlotBuilder()
			.forShopResource(shopResource!)
			.withDates([deliveryDate3])
			.withQuantity(10)
			.buildAndSave()

		// Add 2 product orders on day 1
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(2)
			.withDeliveryDate(deliveryDate1!)
			.buildAndSave()

		// Both delivery slots are not sold out yet
		{
			const futureAvailableDates = await DeliverySlotService.findFutureAvailableDates(shopResource!.id!)
			expect(futureAvailableDates).toHaveLength(3)
			expect(futureAvailableDates[0].date.isSame(deliveryDate1)).toBeTruthy()
			expect(futureAvailableDates[0].isSoldOut).toBeFalsy()
			expect(futureAvailableDates[1].date.isSame(deliveryDate2)).toBeTruthy()
			expect(futureAvailableDates[1].isSoldOut).toBeFalsy()
			expect(futureAvailableDates[2].date.isSame(deliveryDate3)).toBeTruthy()
			expect(futureAvailableDates[2].isSoldOut).toBeFalsy()
		}

		// Add 3 product orders on day 2, making 5 in total for that delivery slot
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(3)
			.withDeliveryDate(deliveryDate2!)
			.buildAndSave()

		// The first delivery slot is sold out, the second isn't
		{
			const futureAvailableDates = await DeliverySlotService.findFutureAvailableDates(shopResource!.id!)
			expect(futureAvailableDates).toHaveLength(3)
			expect(futureAvailableDates[0].date.isSame(deliveryDate1)).toBeTruthy()
			expect(futureAvailableDates[0].isSoldOut).toBeTruthy()
			expect(futureAvailableDates[1].date.isSame(deliveryDate2)).toBeTruthy()
			expect(futureAvailableDates[1].isSoldOut).toBeTruthy()
			expect(futureAvailableDates[2].date.isSame(deliveryDate3)).toBeTruthy()
			expect(futureAvailableDates[2].isSoldOut).toBeFalsy()
		}
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
