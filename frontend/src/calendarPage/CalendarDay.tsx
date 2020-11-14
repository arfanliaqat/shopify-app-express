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
			className={classNames("App-Calendar__Day", {
				"App-Calendar__Day--notSameMonth": !day.isSame(monthStart, "month"),
				"App-Calendar__Day--isToday": day.isSame(moment(), "day")
			})}
		>
			<div className="App-Calendar__DayNumber">{day.format("D")}</div>
			{deliverySlot ? (
				<Link className="App-Calendar__DeliveryDay" to={`/app/delivery_slots/${deliverySlot.id}`}>
					{deliverySlot.quantity}
				</Link>
			) : (
				<div className="App-Calendar__AddInventoryPeriod" onClick={onAddClick}>
					+
				</div>
			)}
		</div>
	)
}
