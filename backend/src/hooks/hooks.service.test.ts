import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { DeliverySlotBuilder } from "../deliverySlots/deliverySlots.builder"
import { HooksService } from "./hooks.service"
import { OrderEventData } from "./hooks.model"
import moment from "moment"
import { ProductOrderService } from "../productOrders/productOrders.service"
import { DatabaseTestService } from "../util/database"

describe("HooksService", () => {
	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
	})

	test("Orders get properly ingested", async () => {
		const deliveryDate = moment("01/12/2020", "DD/MM/YYYY")

		const shop = await new ShopBuilder().buildAndSave()

		const shopResource = await new ShopResourceBuilder()
			.forShop(shop!)
			.withResourceId("Product", 4321)
			.buildAndSave()

		await new DeliverySlotBuilder()
			.forShopResource(shopResource!)
			.withDates([deliveryDate])
			.withQuantity(5)
			.buildAndSave()

		const orderEventData: OrderEventData = {
			id: 1234,
			tags: `Delivery Date: ${deliveryDate.format("DD/MM/YYYY")}`,
			line_items: [
				{
					quantity: 1,
					product_id: 4321
				}
			]
		}

		await HooksService.ingestOrderEvent(shop!, orderEventData)

		const productOrders = await ProductOrderService.findByShopResourceAndDate(shopResource!, deliveryDate)
		expect(productOrders).toHaveLength(1)

		const productOrder = productOrders[0]
		expect(productOrder.quantity).toBe(1)
	})
})
