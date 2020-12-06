import moment, { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { DatabaseTestService, getConnection } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { ProductOrderService } from "./productOrders.service"
import { ProductOrderBuilder } from "./productOrder.builder"

describe("ProductOrderService", () => {
	let refDate: Moment
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined
	let deliveryDate1: Moment | undefined
	let deliveryDate2: Moment | undefined

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		refDate = moment("01/12/2020", "DD/MM/YYYY")
		shop = await new ShopBuilder().buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()
		deliveryDate1 = refDate
		deliveryDate2 = refDate.clone().add(1, "day")
	})

	test("Product orders can be fetched for a given shopResource and date range", async () => {
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withDeliveryDate(refDate)
			.withQuantity(1)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withDeliveryDate(deliveryDate2!)
			.withQuantity(2)
			.buildAndSave()

		const productOrders = await ProductOrderService.findByShopResourceAndDate(
			shopResource!.id!,
			deliveryDate1!,
			deliveryDate2!
		)

		expect(productOrders).toHaveLength(2)

		const totalOrders = productOrders.reduce((acc, po) => acc + po.quantity, 0)
		expect(totalOrders).toBe(3)
	})

	test("Product orders can be retrieved summed up per date", async () => {
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withDeliveryDate(refDate)
			.withQuantity(1)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withDeliveryDate(deliveryDate2!)
			.withQuantity(2)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withDeliveryDate(deliveryDate2!)
			.withQuantity(3)
			.buildAndSave()

		const productOrders = await ProductOrderService.findOrdersSummedPerDate(
			shopResource!.id!,
			deliveryDate1!,
			deliveryDate2!
		)
		expect(productOrders["2020-12-01"]).toBe(1)
		expect(productOrders["2020-12-02"]).toBe(5)
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
