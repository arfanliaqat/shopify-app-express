import React, { useMemo } from "react"
import moment, { Moment } from "moment"
import classNames from "classnames"
import AvailabilityPeriod from "../models/AvailabilityPeriod"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import PeriodElementWithSharedQuantity from "./PeriodElementWithSharedQuantity"
import PeriodElementWithoutSharedQuantity from "./PeriodElementWithoutSharedQuantity"

interface Props {
	monthStart: Moment
	day: Moment
	availabilityPeriod?: AvailabilityPeriod
	onAddClick: () => void
	orders: number
}

export default function CalendarDay({ monthStart, day, availabilityPeriod: period, orders, onAddClick }: Props) {
	const currentStrDay = useMemo(() => day.format(SYSTEM_DATE_FORMAT), [day])
	const notSameMonth = useMemo(() => !day.isSame(monthStart, "month"), [day])
	const isToday = useMemo(() => day.isSame(moment(), "day"), [day])
	const periodFirstDate = useMemo(() => period?.fromDate?.isSame(day, "day"), [day, period])
	const periodLastDate = useMemo(() => period?.toDate?.isSame(day, "day"), [day, period])
	const periodDateNotAvailable = useMemo(() => !period?.dates?.find((strDate) => strDate == currentStrDay), [
		currentStrDay,
		period
	])

	return (
		<div className={classNames("day", { notSameMonth, isToday })}>
			<div className="number">{day.format("D")}</div>
			{period ? (
				period.quantityIsShared ? (
					<PeriodElementWithSharedQuantity
						periodFirstDate={periodFirstDate}
						periodLastDate={periodLastDate}
						periodDateNotAvailable={periodDateNotAvailable}
						orders={orders}
						availabilityPeriod={period}
					/>
				) : (
					<PeriodElementWithoutSharedQuantity
						periodFirstDate={periodFirstDate}
						periodLastDate={periodLastDate}
						periodDateNotAvailable={periodDateNotAvailable}
						orders={orders}
						availabilityPeriod={period}
					/>
				)
			) : (
				<div className="addInventoryPeriod" onClick={onAddClick}>
					+
				</div>
			)}
		</div>
	)
}
