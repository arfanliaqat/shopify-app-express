import { Moment } from "moment"

export default interface DeliverySlot {
	id: string
	resourceId: string
	deliveryDates: string[]
	quantity: number

	fromDate?: Moment
	toDate?: Moment
}
