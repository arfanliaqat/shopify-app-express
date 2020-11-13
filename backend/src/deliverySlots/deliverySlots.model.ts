export interface DeliverySlotSchema {
	id: string
	shop_resource_id: string
	capacity: string
	start_date: string
	end_date: string
	dates: string
	created_date: Date
}

export interface DeliverySlot {
	id: string
	shopResourceId: string
	capacity: string
	startDate: string
	endDate: string
	dates: string
	createdDate: Date
}

export function toDeliverySlot(schema: DeliverySlotSchema): DeliverySlot {
	return {
		id: schema.id,
		shopResourceId: schema.shop_resource_id,
		capacity: schema.capacity,
		startDate: schema.start_date,
		endDate: schema.end_date,
		dates: schema.dates,
		createdDate: schema.created_date
	}
}
