import { Moment } from "moment"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { DeliverySlot, DeliverySlotSchema } from "./deliverySlots.model"
import { UnexpectedError } from "../util/error"

export async function findDeliverySlots(shopResourceId: string, mFrom: Moment, mTo: Moment): Promise<DeliverySlot[]> {
	if (!shopResourceId) return []
	const conn: Pool = await getConnection()
	const result = await conn.query<DeliverySlotSchema>(
		`
		SELECT id, shop_resource_id, quantity, start_date, end_date, dates
		FROM delivery_slots
		WHERE shop_resource_id = $1
		AND start_date between $2 and $3
		AND end_date between $2 and $3`,
		[shopResourceId, mFrom.format("YYYY-MM-DD"), mTo.format("YYYY-MM-DD")]
	)
	return DeliverySlot.createFromSchemas(result.rows)
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
			dates[0].format("YYYY-MM-DD"),
			dates[dates.length - 1].format("YYYY-MM-DD"),
			JSON.stringify(dates)
		]
	)
	const schema = result.rows[0]
	return schema ? DeliverySlot.createFromSchema(schema) : undefined
}
