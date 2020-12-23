import React from "react"
import { Link } from "react-router-dom"
import moment, { Moment } from "moment"
import classNames from "classnames"
import DeliverySlot from "../models/DeliverySlot"

interface Props {
	monthStart: Moment
	day: Moment
	deliverySlot?: DeliverySlot
	onAddClick: () => void
}

export default function CalendarDay({ monthStart, day, deliverySlot, onAddClick }: Props) {
	return (
		<div
			className={classNames("calendarDay", {
				calendarDayNotSameMonth: !day.isSame(monthStart, "month"),
				calendarDayIsToday: day.isSame(moment(), "day")
			})}
		>
			<div className="calendarDayNumber">{day.format("D")}</div>
			{deliverySlot ? (
				<Link className="calendarAvailabilityPeriodElement" to={`/app/delivery_slots/${deliverySlot.id}`}>
					{deliverySlot.quantity}
				</Link>
			) : (
				<div className="calendarAddInventoryPeriod" onClick={onAddClick}>
					+
				</div>
			)}
		</div>
	)
}
