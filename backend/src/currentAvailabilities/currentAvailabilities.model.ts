import moment, { Moment } from "moment"

export interface CurrentAvailabilitySchema {
	id: string
	shop_resource_id: string
	next_availability_date: Date | undefined
	last_availability_date: Date | undefined
	sold_out_dates: number
	available_dates: number
	updated_date: Date
}

export class CurrentAvailability {
	constructor(
		public id: string | undefined,
		public shopResourceId: string,
		public nextAvailabilityDate: Moment | undefined,
		public lastAvailabilityDate: Moment | undefined,
		public soldOutDates: number,
		public availableDates: number,
		public updated_date?: Date
	) {}

	static createFromSchema(schema: CurrentAvailabilitySchema): CurrentAvailability {
		return new CurrentAvailability(
			schema.id,
			schema.shop_resource_id,
			schema.next_availability_date ? moment(schema.next_availability_date) : undefined,
			schema.last_availability_date ? moment(schema.last_availability_date) : undefined,
			schema.sold_out_dates,
			schema.available_dates,
			schema.updated_date
		)
	}
}
