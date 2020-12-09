import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { HooksService } from "./hooks.service"
import moment, { Moment } from "moment"
import { ProductOrderService } from "../productOrders/productOrders.service"
import { DatabaseTestService, getConnection } from "../util/database"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"

describe("HooksService", () => {
	let deliveryDate: Moment
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		deliveryDate = moment("01/12/2020", "DD/MM/YYYY")
		shop = await new ShopBuilder().buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()

		await HooksService.ingestOrderEvent("creation", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate.format("DD/MM/YYYY")
						}
					]
				}
			]
		})
	})

	test("Orders get properly ingested", async () => {
		const productOrders = await ProductOrderService.findByShopResourceAndDate(
			shopResource!.id!,
			deliveryDate,
			deliveryDate
		)
		expect(productOrders).toHaveLength(1)

		const productOrder = productOrders[0]
		expect(productOrder.quantity).toBe(1)
	})

	test("If the order changes with another product, it doesn't retain the previously ingested product order", async () => {
		{
			// So it creates a product orders record for it
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				deliveryDate,
				deliveryDate
			)
			expect(productOrders).toHaveLength(1)
		}

		await HooksService.ingestOrderEvent("update", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 6666,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate.format("DD/MM/YYYY")
						}
					]
				}
			] // This product doesn't exist
		})

		{
			// So we shouldn't have any records for this product
			const productOrders = await ProductOrderService.findByShopResource(shopResource!)
			expect(productOrders).toHaveLength(0)
		}
	})

	test("If the quantity of a product changes in an order, the product order quantity for that date gets updated", async () => {
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				deliveryDate,
				deliveryDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("update", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 3,
					product_id: 4321,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate.format("DD/MM/YYYY")
						}
					]
				}
			]
		})

		{
			const productOrders = await ProductOrderService.findByShopResource(shopResource!)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(3)
		}
	})

	test("When the event is of type cancellation it removes the product orders", async () => {
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				deliveryDate,
				deliveryDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("cancellation", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate.format("DD/MM/YYYY")
						}
					]
				}
			]
		})

		{
			const productOrders = await ProductOrderService.findByShopResource(shopResource!)
			expect(productOrders).toHaveLength(0)
		}
	})

	test("When the event is of type deletion it removes the product orders", async () => {
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				deliveryDate,
				deliveryDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("deletion", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate.format("DD/MM/YYYY")
						}
					]
				}
			]
		})

		{
			const productOrders = await ProductOrderService.findByShopResource(shopResource!)
			expect(productOrders).toHaveLength(0)
		}
	})

	test("When the event cancelled_at property is not null it removes the product orders", async () => {
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				deliveryDate,
				deliveryDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("update", shop!, {
			id: 1234,
			cancelled_at: "2020-12-03T16:10:47-05:00",
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate.format("DD/MM/YYYY")
						}
					]
				}
			]
		})

		{
			const productOrders = await ProductOrderService.findByShopResource(shopResource!)
			expect(productOrders).toHaveLength(0)
		}
	})

	test("It handles multiple delivery dates in the same order", async () => {
		const shopResource2 = await new ShopResourceBuilder()
			.forShop(shop!)
			.withResourceId("Product", 5555)
			.buildAndSave()

		const deliveryDate1 = deliveryDate.clone().add(1, "day")
		const deliveryDate2 = deliveryDate.clone().add(2, "day")

		await HooksService.ingestOrderEvent("update", shop!, {
			id: 1234,
			cancelled_at: "2020-12-03T16:10:47-05:00",
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate1.format("DD/MM/YYYY")
						}
					]
				},
				{
					quantity: 5,
					product_id: 5555,
					properties: [
						{
							name: "Delivery Date",
							value: deliveryDate2.format("DD/MM/YYYY")
						}
					]
				}
			]
		})

		const productOrders1 = await ProductOrderService.findByShopResourceAndDate(
			shopResource!.id!,
			deliveryDate1,
			deliveryDate1
		)
		expect(productOrders1).toHaveLength(1)
		expect(productOrders1[0].deliveryDate.isSame(deliveryDate1)).toBeTruthy()
		expect(productOrders1[0].quantity).toBe(1)

		const productOrders2 = await ProductOrderService.findByShopResourceAndDate(
			shopResource2!.id!,
			deliveryDate2,
			deliveryDate2
		)
		expect(productOrders2).toHaveLength(1)
		expect(productOrders2[0].deliveryDate.isSame(deliveryDate2)).toBeTruthy()
		expect(productOrders2[0].quantity).toBe(5)
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
