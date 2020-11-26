import moment, { Moment } from "moment"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { DeliverySlot, DeliverySlotSchema } from "./deliverySlots.model"
import { UnexpectedError } from "../util/error"
import { DATE_FORMAT } from "../util/constants"

export async function findDeliverySlots(shopResourceId: string, mFrom: Moment, mTo: Moment): Promise<DeliverySlot[]> {
	if (!shopResourceId) return []
	const conn: Pool = await getConnection()
	const result = await conn.query<DeliverySlotSchema>(
		`
		SELECT id, shop_resource_id, quantity, start_date, end_date, dates
		FROM delivery_slots
		WHERE shop_resource_id = $1
		AND (start_date between $2 and $3 OR end_date between $2 and $3)`,
		[shopResourceId, mFrom.format(DATE_FORMAT), mTo.format(DATE_FORMAT)]
	)
	return DeliverySlot.createFromSchemas(result.rows)
}

export async function findFutureAvailableDates(shopResourceId: string): Promise<Moment[]> {
	const from = moment().startOf("day")
	const to = moment().startOf("day").add(3, "months")
	const slots = await findDeliverySlots(shopResourceId, from, to)
	return slots
		.map((slot) => slot.dates)
		.flat()
		.filter((date) => date.isSameOrAfter(from))
		.sort((d1, d2) => d1.valueOf() - d2.valueOf())
}

export async function findDeliverySlotById(deliverySlotId: string): Promise<DeliverySlot | undefined> {
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

export async function createDeliverySlot(
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
			dates[0].format(DATE_FORMAT),
			dates[dates.length - 1].format(DATE_FORMAT),
			JSON.stringify(dates)
		]
	)
	const schema = result.rows[0]
	return schema ? DeliverySlot.createFromSchema(schema) : undefined
}

export async function updateShopResource(deliverySlot: DeliverySlot): Promise<void> {
	const conn: Pool = await getConnection()
	if (!deliverySlot.id) throw new UnexpectedError("`id` is required to update the delivery slot")
	if (deliverySlot.dates.length == 0) throw new UnexpectedError("`dates` cannot be empty")
	await conn.query<DeliverySlotSchema>(
		`UPDATE delivery_slots SET quantity = $1, start_date = $2, end_date = $3, dates = $4 WHERE id = $5`,
		[
			deliverySlot.quantity,
			deliverySlot.getFirstDate()?.format(DATE_FORMAT),
			deliverySlot.getLastDate()?.format(DATE_FORMAT),
			JSON.stringify(deliverySlot.dates.map((d) => d.format(DATE_FORMAT))),
			deliverySlot.id
		]
	)
}

export async function deleteDeliverySlot(deliverySlot: DeliverySlot): Promise<void> {
	const conn: Pool = await getConnection()
	if (!deliverySlot.id) throw new UnexpectedError("`id` is required to update the delivery slot")
	await conn.query<DeliverySlotSchema>(`DELETE FROM delivery_slots WHERE id = $1`, [deliverySlot.id])
}
