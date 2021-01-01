import moment, { Moment } from "moment"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"

export default interface AvailabilityPeriod {
	id: string
	resourceId: string
	dates: string[]
	quantity: number
	quantityIsShared: boolean

	fromDate?: Moment
	toDate?: Moment
}

export function getTotalOrders(availabilityPeriod: AvailabilityPeriod, ordersPerDate: OrdersPerDate) {
	return availabilityPeriod.dates.reduce((acc, date) => acc + (ordersPerDate[date] || 0), 0)
}

export function isSoldOut(availabilityPeriod: AvailabilityPeriod, ordersPerDate: OrdersPerDate, date: Moment) {
	if (availabilityPeriod.quantityIsShared) {
		return getTotalOrders(availabilityPeriod, ordersPerDate) >= availabilityPeriod.quantity
	} else {
		const strDate = date.format(SYSTEM_DATE_FORMAT)
		const orders = ordersPerDate[strDate] || 0
		return orders >= availabilityPeriod.quantity
	}
}
