import moment, { Moment } from "moment"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { AvailableDate, DeliverySlot, DeliverySlotSchema } from "./deliverySlots.model"
import { UnexpectedError } from "../util/error"
import { SYSTEM_DATE_FORMAT } from "../util/constants"
import { ProductOrderService } from "../productOrders/productOrders.service"

export class DeliverySlotService {
	static async findDeliverySlots(shopResourceId: string, mFrom: Moment, mTo: Moment): Promise<DeliverySlot[]> {
		if (!shopResourceId) return []
		const conn: Pool = await getConnection()
		const result = await conn.query<DeliverySlotSchema>(
			`
			SELECT id, shop_resource_id, quantity, start_date, end_date, dates
			FROM delivery_slots
			WHERE shop_resource_id = $1
			AND (start_date between $2 and $3 OR end_date between $2 and $3)`,
			[shopResourceId, mFrom.format(SYSTEM_DATE_FORMAT), mTo.format(SYSTEM_DATE_FORMAT)]
		)
		return DeliverySlot.createFromSchemas(result.rows)
	}

	static async findFutureAvailableDates(shopResourceId: string): Promise<AvailableDate[]> {
		const from = moment().startOf("day")
		const to = moment().startOf("day").add(3, "months")

		// Fetched future delivery slots for this shop resource
		const slots = await this.findDeliverySlots(shopResourceId, from, to)
		const slotsById = slots.reduce<{ [id: string]: DeliverySlot }>((acc, slot) => {
			acc[slot.id!] = slot
			return acc
		}, {})

		// Get all the available dates in ascending ordered
		const availableDates: AvailableDate[] = []
		slots.forEach((slot) => {
			slot.dates.forEach((date) => {
				availableDates.push(new AvailableDate(slot.id!, date, false))
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

		// Calculate the number of orders per delivery slot
		const ordersPerDeliverySlotId = {} as { [slotId: string]: number }
		availableDates.forEach((availableDate) => {
			const numberOfOrders = ordersPerDate[availableDate.date.format(SYSTEM_DATE_FORMAT)]
			if (!numberOfOrders) return
			if (!ordersPerDeliverySlotId[availableDate.deliverySlotId]) {
				ordersPerDeliverySlotId[availableDate.deliverySlotId] = 0
			}
			ordersPerDeliverySlotId[availableDate.deliverySlotId] += numberOfOrders
		})

		// Set isSoldOut flag on the available dates
		availableDates.forEach((availableDate) => {
			const slot = slotsById[availableDate.deliverySlotId]
			if (!slot) return
			const numberOfOrders = ordersPerDeliverySlotId[availableDate.deliverySlotId] || 0
			availableDate.isSoldOut = numberOfOrders >= slot.quantity
		})

		return availableDates
	}

	static async findDeliverySlotById(deliverySlotId: string): Promise<DeliverySlot | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<DeliverySlotSchema>(
			`
			SELECT ds.id, sr.shop_id, ds.shop_resource_id, ds.quantity, ds.start_date, ds.end_date, ds.dates
			FROM delivery_slots ds
			JOIN shop_resources sr ON sr.id = ds.shop_resource_id
			WHERE ds.id = $1`,
			[deliverySlotId]
		)
		const schema = result.rows[0]
		return schema ? DeliverySlot.createFromSchema(schema) : undefined
	}

	static async createDeliverySlot(
		shopResourceId: string,
		dates: Moment[],
		quantity: number
	): Promise<DeliverySlot | undefined> {
		if (dates.length == 0) throw new UnexpectedError("`dates` cannot be empty")
		const conn: Pool = await getConnection()
		const result = await conn.query<DeliverySlotSchema>(
			`
			INSERT INTO delivery_slots (shop_resource_id, quantity, start_date, end_date, dates)
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
		return schema ? DeliverySlot.createFromSchema(schema) : undefined
	}

	static async updateShopResource(deliverySlot: DeliverySlot): Promise<void> {
		const conn: Pool = await getConnection()
		if (!deliverySlot.id) throw new UnexpectedError("`id` is required to update the delivery slot")
		if (deliverySlot.dates.length == 0) throw new UnexpectedError("`dates` cannot be empty")
		await conn.query<DeliverySlotSchema>(
			`UPDATE delivery_slots
			 SET quantity = $1, start_date = $2, end_date = $3, dates = $4
			 WHERE id = $5`,
			[
				deliverySlot.quantity,
				deliverySlot.getFirstDate()?.format(SYSTEM_DATE_FORMAT),
				deliverySlot.getLastDate()?.format(SYSTEM_DATE_FORMAT),
				JSON.stringify(deliverySlot.dates.map((d) => d.format(SYSTEM_DATE_FORMAT))),
				deliverySlot.id
			]
		)
	}

	static async deleteDeliverySlot(deliverySlot: DeliverySlot): Promise<void> {
		const conn: Pool = await getConnection()
		if (!deliverySlot.id) throw new UnexpectedError("`id` is required to update the delivery slot")
		await conn.query<DeliverySlotSchema>(`DELETE FROM delivery_slots WHERE id = $1`, [deliverySlot.id])
	}
}
