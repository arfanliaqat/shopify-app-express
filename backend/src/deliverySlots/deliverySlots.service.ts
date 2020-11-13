import { Moment } from "moment"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { DeliverySlot, DeliverySlotSchema, toDeliverySlot } from "./deliverySlots.model"

export async function findDeliverySlots(shopResourceId: string, mFrom: Moment, mTo: Moment): Promise<DeliverySlot[]> {
	const conn: Pool = await getConnection()
	const result = await conn.query<DeliverySlotSchema>(
		`
		SELECT id, shop_resource_id, capacity, start_date, end_date, dates
		FROM delivery_slots
		WHERE shop_resource_id = $1
		AND start_date between $2 and $3
		AND end_date between $2 and $3`,
		[shopResourceId, mFrom.format("YYYY-MM-DD"), mTo.format("YYYY-MM-DD")]
	)
	return result.rows.map(toDeliverySlot)
}
