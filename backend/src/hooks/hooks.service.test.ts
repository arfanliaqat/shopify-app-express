import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { getChosenDate, HooksService } from "./hooks.service"
import moment, { Moment } from "moment"
import { ProductOrderService } from "../productOrders/productOrders.service"
import { DatabaseTestService, getConnection } from "../util/database"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { SYSTEM_DATE_FORMAT, TAG_LABEL } from "../util/constants"
import { AvailabilityPeriodBuilder } from "../availabilityPeriods/availabilityPeriods.builder"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { WidgetSettingsBuilder } from "../widget/widget.builder"

describe("HooksService", () => {
	let availableDate: Moment
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined

	async function ingestOrderEvent() {
		await HooksService.ingestOrderEvent("create", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate.format("DD/MM/YYYY")
						}
					]
				}
			]
		})
	}

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		availableDate = moment("01/12/2020", "DD/MM/YYYY")
		shop = await new ShopBuilder().buildAndSave()
		await new WidgetSettingsBuilder(shop!.id!).withFirstAvailableDateInDays(0).buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()
	})

	test("Orders get properly ingested", async () => {
		await ingestOrderEvent()
		const productOrders = await ProductOrderService.findByShopResourceAndDate(
			shopResource!.id!,
			availableDate,
			availableDate
		)
		expect(productOrders).toHaveLength(1)

		const productOrder = productOrders[0]
		expect(productOrder.quantity).toBe(1)
	})

	test("If the order changes with another product, it doesn't retain the previously ingested product order", async () => {
		await ingestOrderEvent()
		{
			// So it creates a product orders record for it
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				availableDate,
				availableDate
			)
			expect(productOrders).toHaveLength(1)
		}

		await HooksService.ingestOrderEvent("updated", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 6666,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate.format("DD/MM/YYYY")
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
		await ingestOrderEvent()
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				availableDate,
				availableDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("updated", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 3,
					product_id: 4321,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate.format("DD/MM/YYYY")
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
		await ingestOrderEvent()
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				availableDate,
				availableDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("cancelled", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate.format("DD/MM/YYYY")
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
		await ingestOrderEvent()
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				availableDate,
				availableDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("delete", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate.format("DD/MM/YYYY")
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
		await ingestOrderEvent()
		{
			const productOrders = await ProductOrderService.findByShopResourceAndDate(
				shopResource!.id!,
				availableDate,
				availableDate
			)
			expect(productOrders).toHaveLength(1)
			expect(productOrders[0].quantity).toBe(1)
		}

		await HooksService.ingestOrderEvent("updated", shop!, {
			id: 1234,
			cancelled_at: "2020-12-03T16:10:47-05:00",
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate.format("DD/MM/YYYY")
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

	test("It handles multiple chosen dates in the same order", async () => {
		await ingestOrderEvent()
		const shopResource2 = await new ShopResourceBuilder()
			.forShop(shop!)
			.withResourceId("Product", 5555)
			.buildAndSave()

		const availableDate1 = availableDate.clone().add(1, "day")
		const availableDate2 = availableDate.clone().add(2, "day")

		await HooksService.ingestOrderEvent("updated", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 1,
					product_id: 4321,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate1.format("DD/MM/YYYY")
						}
					]
				},
				{
					quantity: 5,
					product_id: 5555,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate2.format("DD/MM/YYYY")
						}
					]
				}
			]
		})

		const productOrders1 = await ProductOrderService.findByShopResourceAndDate(
			shopResource!.id!,
			availableDate1,
			availableDate1
		)
		expect(productOrders1).toHaveLength(1)
		expect(productOrders1[0].chosenDate.isSame(availableDate1, "day")).toBeTruthy()
		expect(productOrders1[0].quantity).toBe(1)

		const productOrders2 = await ProductOrderService.findByShopResourceAndDate(
			shopResource2!.id!,
			availableDate2,
			availableDate2
		)
		expect(productOrders2).toHaveLength(1)
		expect(productOrders2[0].chosenDate.isSame(availableDate2, "day")).toBeTruthy()
		expect(productOrders2[0].quantity).toBe(5)
	})

	test("Date is parsed correctly", async () => {
		const availableDate = getChosenDate({
			product_id: 123,
			quantity: 2,
			properties: [
				{
					name: TAG_LABEL,
					value: "20/12/2020"
				}
			]
		})

		expect(availableDate!.format(SYSTEM_DATE_FORMAT)).toBe("2020-12-20")
	})

	test("When an order gets ingested it refreshes the current availabilities cache", async () => {
		const availableDate1 = moment().startOf("week").add(1, "week")
		const availableDate2 = availableDate1.clone().add(1, "day")
		const availableDate3 = availableDate1.clone().add(3, "day")
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate1, availableDate2, availableDate3])
			.withQuantityIsShared(false)
			.withQuantity(2)
			.buildAndSave()

		await HooksService.ingestOrderEvent("create", shop!, {
			id: 1234,
			line_items: [
				{
					quantity: 2,
					product_id: 4321,
					properties: [
						{
							name: TAG_LABEL,
							value: availableDate1.format("DD/MM/YYYY")
						}
					]
				}
			]
		})

		const { results } = await ShopResourceService.searchShopResources(shop!, {})
		const product = results[0]
		expect(product.nextAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate2?.format(SYSTEM_DATE_FORMAT)
		)
		expect(product.lastAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate3?.format(SYSTEM_DATE_FORMAT)
		)
		expect(product.availableDates).toBe(2)
		expect(product.soldOutDates).toBe(1)
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
