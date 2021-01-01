import React from "react"
import classNames from "classnames"
import { Link } from "react-router-dom"
import { AvailabilityPeriod } from "../models/AvailabilityPeriod"

interface Props {
	periodFirstDate: boolean
	periodLastDate: boolean
	periodDateNotAvailable: boolean
	orders: number
	availabilityPeriod: AvailabilityPeriod
	totalOrders: number
}

export default function PeriodElementWithSharedQuantity({
	periodFirstDate,
	periodLastDate,
	periodDateNotAvailable,
	orders,
	availabilityPeriod: period,
	totalOrders
}: Props) {
	const nbOrdersTxt = `${orders} order${orders != 1 ? "s" : ""}`
	const isSoldOut = period && totalOrders >= period.quantity
	const headerText = period ? `${totalOrders} / ${period.quantity} orders` : ""
	const headerTextTitle = period
		? `${totalOrders} orders out of ${period.quantity} planned ${isSoldOut ? " (Sold out)" : ""}`
		: ""

	return (
		<Link
			className={classNames("availabilityPeriodDate", {
				periodFirstDate,
				periodLastDate,
				periodDateNotAvailable,
				isSoldOut,
				quantityIsShared: period.quantityIsShared
			})}
			to={`/app/availability_periods/${period.id}`}
		>
			<span className="itemHeader">
				{periodFirstDate && (
					<span title={headerTextTitle}>
						{isSoldOut ? (
							<>
								<strong>Sold out</strong> ({totalOrders} orders)
							</>
						) : (
							headerText
						)}
					</span>
				)}
			</span>
			<span className="itemBody">
				{periodDateNotAvailable ? <em title="Not available">Not available</em> : <span>{nbOrdersTxt}</span>}
			</span>
		</Link>
	)
}
