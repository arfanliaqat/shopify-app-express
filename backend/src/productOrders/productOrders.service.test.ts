import moment, { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { DatabaseTestService } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { HooksService } from "../hooks/hooks.service"
import { ProductOrderService } from "./productOrders.service"
import { ProductOrderBuilder } from "./productOrder.builder"

describe("HooksService", () => {
	let refDate: Moment
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		refDate = moment("01/12/2020", "DD/MM/YYYY")
		shop = await new ShopBuilder().buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()
	})

	test("Product orders can be fetched for a given shopResource and date range", async () => {
		const deliveryDate1 = refDate
		const deliveryDate2 = refDate.clone().add(1, "day")

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withDeliveryDate(refDate)
			.withQuantity(1)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withDeliveryDate(deliveryDate2)
			.withQuantity(2)
			.buildAndSave()

		const productOrders = await ProductOrderService.findByShopResourceAndDate(
			shopResource!,
			deliveryDate1,
			deliveryDate2
		)

		expect(productOrders).toHaveLength(2)

		const totalOrders = productOrders.reduce((acc, po) => acc + po.quantity, 0)
		expect(totalOrders).toBe(3)
	})
})
