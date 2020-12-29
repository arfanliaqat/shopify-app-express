import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import moment, { Moment } from "moment"
import classNames from "classnames"
import AvailabilityPeriod from "../models/AvailabilityPeriod"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"

interface Props {
	monthStart: Moment
	day: Moment
	availabilityPeriod?: AvailabilityPeriod
	onAddClick: () => void
	orders: number
}

export default function CalendarDay({ monthStart, day, availabilityPeriod, orders, onAddClick }: Props) {
	const currentStrDay = useMemo(() => day.format(SYSTEM_DATE_FORMAT), [day])
	const notSameMonth = useMemo(() => !day.isSame(monthStart, "month"), [day])
	const isToday = useMemo(() => day.isSame(moment(), "day"), [day])
	const periodFirstDate = useMemo(() => availabilityPeriod?.fromDate?.isSame(day, "day"), [day, availabilityPeriod])
	const periodLastDate = useMemo(() => availabilityPeriod?.toDate?.isSame(day, "day"), [day, availabilityPeriod])
	const periodDateNotAvailable = useMemo(
		() => !availabilityPeriod?.dates?.find((strDate) => strDate == currentStrDay),
		[currentStrDay, availabilityPeriod]
	)
	const nbOrdersTxt = `${orders} order${orders != 1 ? "s" : ""}`
	const isSoldOut = availabilityPeriod && availabilityPeriod.totalOrders >= availabilityPeriod.quantity
	const headerText = availabilityPeriod
		? `${availabilityPeriod.totalOrders} / ${availabilityPeriod.quantity} orders`
		: ""
	const headerTextTitle = availabilityPeriod
		? `${availabilityPeriod.totalOrders} orders out of ${availabilityPeriod.quantity} planned ${
				isSoldOut ? " (Sold out)" : ""
		  }`
		: ""
	return (
		<div className={classNames("day", { notSameMonth, isToday })}>
			<div className="number">{day.format("D")}</div>
			{availabilityPeriod ? (
				<Link
					className={classNames("availabilityPeriodDate", {
						periodFirstDate,
						periodLastDate,
						periodDateNotAvailable,
						isSoldOut
					})}
					to={`/app/availability_periods/${availabilityPeriod.id}`}
				>
					<span className="itemHeader">
						{periodFirstDate && (
							<span title={headerTextTitle}>
								{isSoldOut ? (
									<>
										<strong>Sold out</strong> ({availabilityPeriod.totalOrders} orders)
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
