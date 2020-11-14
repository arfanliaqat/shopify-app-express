import moment, { Moment } from "moment"
import DeliverySlotViewModel from "../../../frontend/src/models/DeliverySlot"

export interface DeliverySlotSchema {
	id: string
	shop_resource_id: string
	quantity: number
	start_date: Date
	end_date: Date
	dates: string
	created_date: string
}

export class DeliverySlot {
	constructor(
		public id: string,
		public shopResourceId: string,
		public quantity: number,
		public startDate: Moment,
		public endDate: Moment,
		public dates: Moment[],
		public createdDate: Moment
	) {}

	static createFromSchema(schema: DeliverySlotSchema): DeliverySlot {
		return new DeliverySlot(
			schema.id,
			schema.shop_resource_id,
			schema.quantity,
			moment(schema.start_date),
			moment(schema.end_date),
			((schema.dates || []) as string[]).map((date) => moment(date)),
			moment(schema.created_date)
		)
	}

	static createFromSchemas(schemas: DeliverySlotSchema[]): DeliverySlot[] {
		return schemas.map(DeliverySlot.createFromSchema)
	}

	toViewModel(): DeliverySlotViewModel {
		return {
			id: this.id,
			resourceId: this.shopResourceId,
			deliveryDates: this.dates.map((date) => date.format("YYYY-MM-DD")),
			quantity: this.quantity
		}
	}

	static toViewModels(slots: DeliverySlot[]): DeliverySlotViewModel[] {
		return slots.map((slot) => slot.toViewModel())
	}
}
