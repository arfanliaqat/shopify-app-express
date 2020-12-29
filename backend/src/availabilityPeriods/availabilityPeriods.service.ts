import moment, { Moment } from "moment"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { AvailableDate, AvailabilityPeriod, AvailabilityPeriodSchema } from "./availabilityPeriods.model"
import { UnexpectedError } from "../util/error"
import { SYSTEM_DATE_FORMAT } from "../util/constants"
import { ProductOrderService } from "../productOrders/productOrders.service"

export class AvailabilityPeriodService {
	static async findAvailabilityPeriods(
		shopResourceId: string,
		mFrom: Moment,
		mTo: Moment
	): Promise<AvailabilityPeriod[]> {
		if (!shopResourceId) return []
		const conn: Pool = await getConnection()
		const result = await conn.query<AvailabilityPeriodSchema>(
			`
			SELECT id, shop_resource_id, quantity, start_date, end_date, dates
			FROM availability_periods
			WHERE shop_resource_id = $1
			AND (start_date between $2 and $3 OR end_date between $2 and $3)`,
			[shopResourceId, mFrom.format(SYSTEM_DATE_FORMAT), mTo.format(SYSTEM_DATE_FORMAT)]
		)
		return AvailabilityPeriod.createFromSchemas(result.rows)
	}

	static async findFutureAvailableDates(shopResourceId: string): Promise<AvailableDate[]> {
		const from = moment().startOf("day")
		const to = moment().startOf("day").add(3, "months")

		// Fetched future availability periods for this shop resource
		const periods = await this.findAvailabilityPeriods(shopResourceId, from, to)
		const periodsById = periods.reduce<{ [id: string]: AvailabilityPeriod }>((acc, period) => {
			acc[period.id!] = period
			return acc
		}, {})

		// Get all the available dates in ascending ordered
		const availableDates: AvailableDate[] = []
		periods.forEach((period) => {
			period.dates.forEach((date) => {
				availableDates.push(new AvailableDate(period.id!, date, false))
			})
		})
		if (!availableDates.length) {
			return []
		}
		availableDates.sort((ad1, ad2) => ad1.date.valueOf() - ad2.date.valueOf())

		// Fetched number orders per date for this shop resource
		const firstDate = availableDates[0].date
		const lastDate = availableDates[availableDates.length - 1].date
		const ordersPerDate = await ProductOrderService.findOrdersSummedPerDate(shopResourceId, firstDate, lastDate)

		// Calculate the number of orders per availability period
		const ordersPerAvailabilityPeriodId = {} as { [periodId: string]: number }
		availableDates.forEach((availableDate) => {
			const numberOfOrders = ordersPerDate[availableDate.date.format(SYSTEM_DATE_FORMAT)]
			if (!numberOfOrders) return
			if (!ordersPerAvailabilityPeriodId[availableDate.availabilityPeriodId]) {
				ordersPerAvailabilityPeriodId[availableDate.availabilityPeriodId] = 0
			}
			ordersPerAvailabilityPeriodId[availableDate.availabilityPeriodId] += numberOfOrders
		})

		// Set isSoldOut flag on the available dates
		availableDates.forEach((availableDate) => {
			const period = periodsById[availableDate.availabilityPeriodId]
			if (!period) return
			const numberOfOrders = ordersPerAvailabilityPeriodId[availableDate.availabilityPeriodId] || 0
			availableDate.isSoldOut = numberOfOrders >= period.quantity
		})

		return availableDates
	}

	static async findAvailabilityPeriodById(availabilityPeriodId: string): Promise<AvailabilityPeriod | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<AvailabilityPeriodSchema>(
			`
			SELECT ds.id, sr.shop_id, ds.shop_resource_id, ds.quantity, ds.start_date, ds.end_date, ds.dates
			FROM availability_periods ds
			JOIN shop_resources sr ON sr.id = ds.shop_resource_id
			WHERE ds.id = $1`,
			[availabilityPeriodId]
		)
		const schema = result.rows[0]
		return schema ? AvailabilityPeriod.createFromSchema(schema) : undefined
	}

	static async createAvailabilityPeriod(
		shopResourceId: string,
		dates: Moment[],
		quantity: number
	): Promise<AvailabilityPeriod | undefined> {
		if (dates.length == 0) throw new UnexpectedError("`dates` cannot be empty")
		const conn: Pool = await getConnection()
		const result = await conn.query<AvailabilityPeriodSchema>(
			`
			INSERT INTO availability_periods (shop_resource_id, quantity, start_date, end_date, dates)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, shop_resource_id, quantity, start_date, end_date, dates`,
			[
				shopResourceId,
				quantity,
				dates[0].format(SYSTEM_DATE_FORMAT),
				dates[dates.length - 1].format(SYSTEM_DATE_FORMAT),
				JSON.stringify(dates)
			]
		)
		const schema = result.rows[0]
		return schema ? AvailabilityPeriod.createFromSchema(schema) : undefined
	}

	static async updateShopResource(availabilityPeriod: AvailabilityPeriod): Promise<void> {
		const conn: Pool = await getConnection()
		if (!availabilityPeriod.id) throw new UnexpectedError("`id` is required to update the availability period")
		if (availabilityPeriod.dates.length == 0) throw new UnexpectedError("`dates` cannot be empty")
		await conn.query<AvailabilityPeriodSchema>(
			`UPDATE availability_periods
			 SET quantity = $1, start_date = $2, end_date = $3, dates = $4
			 WHERE id = $5`,
			[
				availabilityPeriod.quantity,
				availabilityPeriod.getFirstDate()?.format(SYSTEM_DATE_FORMAT),
				availabilityPeriod.getLastDate()?.format(SYSTEM_DATE_FORMAT),
				JSON.stringify(availabilityPeriod.dates.map((d) => d.format(SYSTEM_DATE_FORMAT))),
				availabilityPeriod.id
			]
		)
	}

	static async deleteAvailabilityPeriod(availabilityPeriod: AvailabilityPeriod): Promise<void> {
		const conn: Pool = await getConnection()
		if (!availabilityPeriod.id) throw new UnexpectedError("`id` is required to update the availability period")
		await conn.query<AvailabilityPeriodSchema>(`DELETE FROM availability_periods WHERE id = $1`, [
			availabilityPeriod.id
		])
	}
}
