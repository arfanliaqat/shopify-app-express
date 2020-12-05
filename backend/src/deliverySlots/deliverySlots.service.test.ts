import moment, { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { DatabaseTestService } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { DeliverySlotBuilder } from "./deliverySlots.builder"
import { DeliverySlotService } from "./deliverySlots.service"

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
		expect(futureAvailableDates[0].isSame(deliveryDate1)).toBeTruthy()
		expect(futureAvailableDates[1].isSame(deliveryDate2)).toBeTruthy()
	})
})
