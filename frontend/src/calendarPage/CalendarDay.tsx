import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import moment, { Moment } from "moment"
import classNames from "classnames"
import DeliverySlot from "../models/DeliverySlot"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"

interface Props {
	monthStart: Moment
	day: Moment
	deliverySlot?: DeliverySlot
	onAddClick: () => void
	orders: number
}

export default function CalendarDay({ monthStart, day, deliverySlot, orders, onAddClick }: Props) {
	const currentStrDay = useMemo(() => day.format(SYSTEM_DATE_FORMAT), [day])
	const notSameMonth = useMemo(() => !day.isSame(monthStart, "month"), [day])
	const isToday = useMemo(() => day.isSame(moment(), "day"), [day])
	const periodFirstDate = useMemo(() => deliverySlot?.fromDate?.isSame(day, "day"), [day, deliverySlot])
	const periodLastDate = useMemo(() => deliverySlot?.toDate?.isSame(day, "day"), [day, deliverySlot])
	const periodDateNotAvailable = useMemo(
		() => !deliverySlot?.deliveryDates?.find((strDate) => strDate == currentStrDay),
		[currentStrDay, deliverySlot]
	)
	const nbOrdersTxt = `${orders} order${orders != 1 ? "s" : ""}`
	const isSoldOut = deliverySlot && deliverySlot.totalOrders >= deliverySlot.quantity
	const headerText = deliverySlot ? `${deliverySlot.totalOrders} / ${deliverySlot.quantity} orders` : ""
	const headerTextTitle = deliverySlot
		? `${deliverySlot.totalOrders} orders out of ${deliverySlot.quantity} planned ${isSoldOut ? " (Sold out)" : ""}`
		: ""
	return (
		<div className={classNames("day", { notSameMonth, isToday })}>
			<div className="number">{day.format("D")}</div>
			{deliverySlot ? (
				<Link
					className={classNames("availabilityPeriodDate", {
						periodFirstDate,
						periodLastDate,
						periodDateNotAvailable,
						isSoldOut
					})}
					to={`/app/delivery_slots/${deliverySlot.id}`}
				>
					<span className="itemHeader">
						{periodFirstDate && (
							<span title={headerTextTitle}>
								{isSoldOut ? (
									<>
										<strong>Sold out</strong> ({deliverySlot.totalOrders} orders)
									</>
								) : (
									headerText
								)}
							</span>
						)}
					</span>
					<span className="itemBody">
						{periodDateNotAvailable ? (
							<em title="Not available">Not available</em>
						) : (
							<span>{nbOrdersTxt}</span>
						)}
					</span>
				</Link>
			) : (
				<div className="addInventoryPeriod" onClick={onAddClick}>
					+
				</div>
			)}
		</div>
	)
}
