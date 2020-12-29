import { Moment } from "moment"

export default interface AvailabilityPeriod {
	id: string
	resourceId: string
	dates: string[]
	quantity: number

	fromDate?: Moment
	toDate?: Moment
	totalOrders?: number
}
