import { CurrentAvailabilityJob } from "./currentAvailabilities.job"
import moment, { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { DatabaseTestService, getConnection } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { AvailabilityPeriodBuilder } from "../availabilityPeriods/availabilityPeriods.builder"
import { CurrentAvailabilityService } from "./currentAvailabilities.service"
import { SYSTEM_DATE_FORMAT } from "../util/constants"
import { WidgetSettingsBuilder } from "../widget/widget.builder"

describe("CurrentAvailabilityJob", () => {
	let refDate: Moment
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined
	let availableDate1: Moment | undefined
	let availableDate2: Moment | undefined

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		refDate = moment().startOf("week").add(1, "week")
		shop = await new ShopBuilder().buildAndSave()
		await new WidgetSettingsBuilder(shop!.id!).withFirstAvailableDateInDays(0).buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()
		availableDate1 = refDate
		availableDate2 = refDate.clone().add(1, "day")
	})

	test("It refreshes all current availabilities", async () => {
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate1!, availableDate2!])
			.withQuantity(5)
			.buildAndSave()

		await CurrentAvailabilityJob.refreshAll()

		const currentAvailability = await CurrentAvailabilityService.findByShopResourceId(shopResource!.id!)
		expect(currentAvailability!.id).toBeDefined()
		expect(currentAvailability!.nextAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate1?.format(SYSTEM_DATE_FORMAT)
		)
		expect(currentAvailability!.lastAvailabilityDate?.format(SYSTEM_DATE_FORMAT)).toBe(
			availableDate2?.format(SYSTEM_DATE_FORMAT)
		)
		expect(currentAvailability!.availableDates).toBe(2)
		expect(currentAvailability!.soldOutDates).toBe(0)
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
