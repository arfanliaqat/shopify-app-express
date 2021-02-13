import moment, { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { DatabaseTestService, getConnection } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { AvailabilityPeriodBuilder } from "../availabilityPeriods/availabilityPeriods.builder"
import { CurrentAvailabilityService } from "./currentAvailabilities.service"
import { SYSTEM_DATE_FORMAT } from "../util/constants"
import { ProductOrderBuilder } from "../productOrders/productOrder.builder"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { WidgetSettings } from "../widget/widget.model"
import { WidgetSettingsBuilder } from "../widget/widget.builder"

describe("CurrentAvailabilityService", () => {
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined
	let availableDate1: Moment | undefined
	let availableDate2: Moment | undefined
	let widgetSettings: WidgetSettings

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		const refDate = moment().startOf("week").add(1, "week")
		shop = await new ShopBuilder().buildAndSave()
		widgetSettings = await new WidgetSettingsBuilder(shop!.id!).withFirstAvailableDateInDays(0).buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()
		availableDate1 = refDate
		availableDate2 = refDate.clone().add(1, "day")
	})

	test("refreshCurrentAvailability => Scenario 1", async () => {
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate1!, availableDate2!])
			.withQuantity(5)
			.buildAndSave()

		const currentAvailability = await CurrentAvailabilityService.refreshCurrentAvailability(
			shopResource!.id!,
			widgetSettings.settings
		)
		expect(currentAvailability.id).toBeDefined()
		expect(currentAvailability.nextAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate1?.format(SYSTEM_DATE_FORMAT)
		)
		expect(currentAvailability.lastAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate2?.format(SYSTEM_DATE_FORMAT)
		)
		expect(currentAvailability.availableDates).toBe(2)
		expect(currentAvailability.soldOutDates).toBe(0)
	})

	test("refreshCurrentAvailability => Scenario 2", async () => {
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate1!, availableDate2!])
			.withQuantityIsShared(false)
			.withQuantity(2)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(2)
			.withChosenDate(availableDate1!)
			.buildAndSave()

		const currentAvailability = await CurrentAvailabilityService.refreshCurrentAvailability(
			shopResource!.id!,
			widgetSettings.settings
		)
		expect(currentAvailability.nextAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate2?.format(SYSTEM_DATE_FORMAT)
		)
		expect(currentAvailability.lastAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate2?.format(SYSTEM_DATE_FORMAT)
		)
		expect(currentAvailability.availableDates).toBe(1)
		expect(currentAvailability.soldOutDates).toBe(1)
	})

	test("refreshAllByShop", async () => {
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate1!, availableDate2!])
			.withQuantityIsShared(false)
			.withQuantity(2)
			.buildAndSave()

		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(2)
			.withChosenDate(availableDate1!)
			.buildAndSave()

		await CurrentAvailabilityService.refreshAllByShop(shop!)

		const results = await ShopResourceService.searchShopResources(shop!, {})
		const product = results.results[0]
		expect(product.nextAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate2?.format(SYSTEM_DATE_FORMAT)
		)
		expect(product.lastAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate2?.format(SYSTEM_DATE_FORMAT)
		)
		expect(product.availableDates).toBe(1)
		expect(product.soldOutDates).toBe(1)
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
