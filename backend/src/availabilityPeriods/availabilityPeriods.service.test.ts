import moment, { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { DatabaseTestService, getConnection } from "../util/database"
import { ShopBuilder } from "../shop/shop.builder"
import { ShopResourceBuilder } from "../shopResource/shopResource.builder"
import { AvailabilityPeriodBuilder } from "./availabilityPeriods.builder"
import { AvailabilityPeriodService } from "./availabilityPeriods.service"
import { ProductOrderBuilder } from "../productOrders/productOrder.builder"

describe("AvailabilityPeriodService", () => {
	let refDate: Moment
	let shop: Shop | undefined
	let shopResource: ShopResource | undefined
	let availableDate1: Moment | undefined
	let availableDate2: Moment | undefined

	async function createAvailabilityPeriod(dates: Moment[]) {
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates(dates)
			.withQuantity(5)
			.buildAndSave()
	}

	beforeEach(async () => {
		await DatabaseTestService.clearDatabase()
		refDate = moment().startOf("day").startOf("week").add(1, "week")
		shop = await new ShopBuilder().buildAndSave()
		shopResource = await new ShopResourceBuilder().forShop(shop!).withResourceId("Product", 4321).buildAndSave()
		availableDate1 = refDate
		availableDate2 = refDate.clone().add(1, "day")
	})

	test("It retrieves future available dates for a given product", async () => {
		await createAvailabilityPeriod([availableDate1!, availableDate2!])

		const futureAvailableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource!.id!)
		expect(futureAvailableDates).toHaveLength(2)
		expect(futureAvailableDates[0].date.isSame(availableDate1)).toBeTruthy()
		expect(futureAvailableDates[1].date.isSame(availableDate2)).toBeTruthy()
	})

	test("It indicates when the date is sold out", async () => {
		await createAvailabilityPeriod([availableDate1!, availableDate2!])

		const availableDate3 = refDate.clone().add(3, "week")

		// Add one more availability period to make the test scenario more complete
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate3])
			.withQuantity(10)
			.withQuantityIsShared(true)
			.buildAndSave()

		// Add 2 product orders on day 1
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(2)
			.withChosenDate(availableDate1!)
			.buildAndSave()

		// Both availability periods are not sold out yet
		{
			const futureAvailableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource!.id!)
			expect(futureAvailableDates).toHaveLength(3)
			expect(futureAvailableDates[0].date.isSame(availableDate1)).toBeTruthy()
			expect(futureAvailableDates[0].isSoldOut).toBeFalsy()
			expect(futureAvailableDates[1].date.isSame(availableDate2)).toBeTruthy()
			expect(futureAvailableDates[1].isSoldOut).toBeFalsy()
			expect(futureAvailableDates[2].date.isSame(availableDate3)).toBeTruthy()
			expect(futureAvailableDates[2].isSoldOut).toBeFalsy()
		}

		// Add 3 product orders on day 2, making 5 in total for that availability period
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(3)
			.withChosenDate(availableDate2!)
			.buildAndSave()

		// The first availability period is sold out, the second isn't
		{
			const futureAvailableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource!.id!)
			expect(futureAvailableDates).toHaveLength(3)
			expect(futureAvailableDates[0].date.isSame(availableDate1)).toBeTruthy()
			expect(futureAvailableDates[0].isSoldOut).toBeTruthy()
			expect(futureAvailableDates[1].date.isSame(availableDate2)).toBeTruthy()
			expect(futureAvailableDates[1].isSoldOut).toBeTruthy()
			expect(futureAvailableDates[2].date.isSame(availableDate3)).toBeTruthy()
			expect(futureAvailableDates[2].isSoldOut).toBeFalsy()
		}
	})

	test("The sold out indicator takes into account whether the quantity is shared or not", async () => {
		await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate1!, availableDate2!])
			.withQuantity(2)
			.withQuantityIsShared(false)
			.buildAndSave()

		// Add 2 product orders on day 1
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(2)
			.withChosenDate(availableDate1!)
			.buildAndSave()

		// Add 1 product order on day 2
		await new ProductOrderBuilder()
			.forShopResource(shopResource!)
			.withQuantity(1)
			.withChosenDate(availableDate1!)
			.buildAndSave()

		// availableDate1 is sold out
		{
			const futureAvailableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource!.id!)
			expect(futureAvailableDates).toHaveLength(2)
			expect(futureAvailableDates[0].date.isSame(availableDate1)).toBeTruthy()
			expect(futureAvailableDates[0].isSoldOut).toBeTruthy()
			expect(futureAvailableDates[1].date.isSame(availableDate2)).toBeTruthy()
			expect(futureAvailableDates[1].isSoldOut).toBeFalsy()
		}
	})

	test("When a date is paused, the date is marked as sold out", async () => {
		const period = await new AvailabilityPeriodBuilder()
			.forShopResource(shopResource!)
			.withDates([availableDate1!, availableDate2!])
			.withQuantity(5)
			.buildAndSave()

		// Both availability periods are not sold out yet
		{
			const futureAvailableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource!.id!)
			expect(futureAvailableDates).toHaveLength(2)
			expect(futureAvailableDates[0].date.isSame(availableDate1)).toBeTruthy()
			expect(futureAvailableDates[0].isSoldOut).toBeFalsy()
			expect(futureAvailableDates[1].date.isSame(availableDate2)).toBeTruthy()
			expect(futureAvailableDates[1].isSoldOut).toBeFalsy()
		}

		period!.setPausedDates([availableDate1!])
		await AvailabilityPeriodService.update(period!)

		// availableDate1 is sold out
		{
			const futureAvailableDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResource!.id!)
			expect(futureAvailableDates).toHaveLength(2)
			expect(futureAvailableDates[0].date.isSame(availableDate1)).toBeTruthy()
			expect(futureAvailableDates[0].isSoldOut).toBeTruthy()
			expect(futureAvailableDates[1].date.isSame(availableDate2)).toBeTruthy()
			expect(futureAvailableDates[1].isSoldOut).toBeFalsy()
		}
	})

	afterAll(async () => {
		await (await getConnection()).end()
	})
})
