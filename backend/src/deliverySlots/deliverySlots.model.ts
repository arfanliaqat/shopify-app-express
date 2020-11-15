import moment, { Moment } from "moment"
import DeliverySlotViewModel from "../../../frontend/src/models/DeliverySlot"
import { Shop } from "../shop/shop.model"

export interface DeliverySlotSchema {
	id: string
	shop_id?: string // joined
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
		public createdDate: Moment,
		private shopId?: string
	) {}

	addNewDates(newDates: Moment[]): void {
		const filteredNewDates = newDates.filter((newDate) => !this.dates.find((d) => d.isSame(newDate, "day")))
		if (newDates.length == 0) return
		this.dates = this.dates.concat(filteredNewDates)
		this.dates.sort((d1, d2) => {
			if (d1.isBefore(d1)) return -1
			else if (d1.isAfter(d2)) return 1
			return 0
		})
	}

	getLastDate(): Moment | undefined {
		if (this.dates.length == 0) return undefined
		return this.dates[this.dates.length - 1]
	}

	getFirstDate(): Moment | undefined {
		return this.dates[0]
	}

	static createFromSchema(schema: DeliverySlotSchema): DeliverySlot {
		return new DeliverySlot(
			schema.id,
			schema.shop_resource_id,
			schema.quantity,
			moment(schema.start_date),
			moment(schema.end_date),
			((schema.dates || []) as string[]).map((date) => moment(date)),
			moment(schema.created_date),
			schema.shop_id
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

	belongsTo(shop?: Shop): boolean {
		return !!this.shopId && !!shop?.id && this.shopId == shop.id
	}
}
