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
	isPaused: boolean
}

export default function PeriodElementWithoutSharedQuantity({
	periodFirstDate,
	periodLastDate,
	periodDateNotAvailable,
	orders,
	availabilityPeriod: period,
	isPaused
}: Props) {
	const isSoldOut = period && orders >= period.quantity
	return (
		<Link
			className={classNames("availabilityPeriodDate", {
				periodFirstDate,
				periodLastDate,
				periodDateNotAvailable,
				isSoldOut,
				isPaused,
				quantityIsShared: period.quantityIsShared
			})}
			to={`/app/availability_periods/${period.id}`}
		>
			<div className="itemBody">
				{periodDateNotAvailable ? (
					<em title="Not available">Not available</em>
				) : (
					<span>
						{orders} order{orders != 1 ? "s" : ""}
						<br />
						out of {period.quantity}
						<br />
						{isPaused && <span className="paused">Paused</span>}
					</span>
				)}
			</div>
		</Link>
	)
}
