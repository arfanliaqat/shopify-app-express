import moment, { Moment } from "moment"
import DeliverySlotViewModel from "../../../frontend/src/models/DeliverySlot"
import { Shop } from "../shop/shop.model"
import { AvailableDate as AvailableDateViewModel } from "../../../widget/src/models/AvailableDate"
import { SYSTEM_DATE_FORMAT } from "../util/constants"

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
		public id: string | undefined,
		public shopResourceId: string,
		public quantity: number,
		public startDate: Moment,
		public endDate: Moment,
		public dates: Moment[],
		public createdDate?: Moment,
		private shopId?: string
	) {}

	addNewDates(newDates: Moment[] | undefined): void {
		if (!newDates || newDates.length == 0) return
		const filteredNewDates = newDates.filter((newDate) => !this.dates.find((d) => d.isSame(newDate, "day")))
		if (newDates.length == 0) return
		this.dates = this.dates.concat(filteredNewDates)
		this.dates.sort((d1, d2) => {
			if (d1.isBefore(d1)) return -1
			else if (d1.isAfter(d2)) return 1
			return 0
		})
	}

	deleteDates(deletedDates: Moment[] | undefined): void {
		if (!deletedDates || deletedDates.length == 0) return
		this.dates = this.dates.filter((deletedDate) => !deletedDates.find((d) => d.isSame(deletedDate, "day")))
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
			id: this.id!,
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

export class AvailableDate {
	constructor(public deliverySlotId: string, public date: Moment, public isSoldOut: boolean) {}

	static toViewModel(availableDate: AvailableDate): AvailableDateViewModel {
		return {
			date: availableDate.date.format(SYSTEM_DATE_FORMAT),
			isSoldOut: availableDate.isSoldOut
		}
	}
}
