import moment, { Moment } from "moment"
import { AvailabilityPeriod as AvailabilityPeriodViewModel } from "../../../frontend/src/models/AvailabilityPeriod"
import { Shop } from "../shop/shop.model"
import { AvailableDate as AvailableDateViewModel } from "../../../widget/src/models/AvailableDate"
import { SYSTEM_DATE_FORMAT } from "../util/constants"

export interface AvailabilityPeriodSchema {
	id: string
	shop_id?: string // joined
	shop_resource_id: string
	quantity: number
	start_date: Date
	end_date: Date
	available_dates: string
	paused_dates: string
	quantity_is_shared: boolean
	created_date: string
}

export class AvailabilityPeriod {
	constructor(
		public id: string | undefined,
		public shopResourceId: string,
		public quantity: number,
		public startDate: Moment,
		public endDate: Moment,
		public availableDates: Moment[] = [],
		public pausedDates: Moment[] = [],
		public quantityIsShared: boolean,
		public createdDate?: Moment,
		private shopId?: string
	) {}

	addNewDates(newDates: Moment[] | undefined): void {
		if (!newDates || newDates.length == 0) return
		const filteredNewDates = newDates.filter(
			(newDate) => !this.availableDates.find((d) => d.isSame(newDate, "day"))
		)
		if (newDates.length == 0) return
		this.availableDates = this.availableDates.concat(filteredNewDates)
		this.availableDates.sort((d1, d2) => {
			if (d1.isBefore(d1)) return -1
			else if (d1.isAfter(d2)) return 1
			return 0
		})
	}

	deleteDates(deletedDates: Moment[] | undefined): void {
		if (!deletedDates || deletedDates.length == 0) return
		this.availableDates = this.availableDates.filter(
			(deletedDate) => !deletedDates.find((d) => d.isSame(deletedDate, "day"))
		)
	}

	setPausedDates(pausedDates: moment.Moment[] | undefined) {
		this.pausedDates = pausedDates || []
	}

	getLastDate(): Moment | undefined {
		if (this.availableDates.length == 0) return undefined
		return this.availableDates[this.availableDates.length - 1]
	}

	getFirstDate(): Moment | undefined {
		return this.availableDates[0]
	}

	static createFromSchema(schema: AvailabilityPeriodSchema): AvailabilityPeriod {
		return new AvailabilityPeriod(
			schema.id,
			schema.shop_resource_id,
			schema.quantity,
			moment(schema.start_date),
			moment(schema.end_date),
			((schema.available_dates || []) as string[]).map((date) => moment(date)),
			((schema.paused_dates || []) as string[]).map((date) => moment(date)),
			schema.quantity_is_shared,
			moment(schema.created_date),
			schema.shop_id
		)
	}

	static createFromSchemas(schemas: AvailabilityPeriodSchema[]): AvailabilityPeriod[] {
		return schemas.map(AvailabilityPeriod.createFromSchema)
	}

	toViewModel(): AvailabilityPeriodViewModel {
		return new AvailabilityPeriodViewModel(
			this.id!,
			this.shopResourceId,
			this.availableDates.map((date) => date.format("YYYY-MM-DD")),
			this.pausedDates.map((date) => date.format("YYYY-MM-DD")),
			this.quantity,
			this.quantityIsShared
		)
	}

	static toViewModels(periods: AvailabilityPeriod[]): AvailabilityPeriodViewModel[] {
		return periods.map((period) => period.toViewModel())
	}

	belongsTo(shop?: Shop): boolean {
		return !!this.shopId && !!shop?.id && this.shopId == shop.id
	}
}

export class AvailableDate {
	constructor(
		public availabilityPeriodId: string,
		public date: Moment,
		public isSoldOut: boolean,
		public quantityIsShared: boolean
	) {}

	static toViewModel(availableDate: AvailableDate): AvailableDateViewModel {
		return {
			date: availableDate.date.format(SYSTEM_DATE_FORMAT),
			isSoldOut: availableDate.isSoldOut
		}
	}
}
