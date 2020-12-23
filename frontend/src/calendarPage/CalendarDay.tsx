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
}

export default function CalendarDay({ monthStart, day, deliverySlot, onAddClick }: Props) {
	const currentStrDay = useMemo(() => day.format(SYSTEM_DATE_FORMAT), [day])
	const notSameMonth = useMemo(() => !day.isSame(monthStart, "month"), [day])
	const isToday = useMemo(() => day.isSame(moment(), "day"), [day])
	const periodFirstDate = useMemo(() => deliverySlot?.fromDate?.isSame(day, "day"), [day, deliverySlot])
	const periodLastDate = useMemo(() => deliverySlot?.toDate?.isSame(day, "day"), [day, deliverySlot])
	const periodDateNotAvailable = useMemo(
		() => !deliverySlot?.deliveryDates?.find((strDate) => strDate == currentStrDay),
		[currentStrDay, deliverySlot]
	)
	return (
		<div className={classNames("day", { notSameMonth, isToday })}>
			<div className="number">{day.format("D")}</div>
			{deliverySlot ? (
				<Link
					className={classNames("availabilityPeriodDate", {
						periodFirstDate,
						periodLastDate,
						periodDateNotAvailable
					})}
					to={`/app/delivery_slots/${deliverySlot.id}`}
				>
					{periodDateNotAvailable ? "Not available" : deliverySlot.quantity}
				</Link>
			) : (
				<div className="addInventoryPeriod" onClick={onAddClick}>
					+
				</div>
			)}
		</div>
	)
}
