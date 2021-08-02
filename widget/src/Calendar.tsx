import { h } from "preact"

import { ArrowLeftCircle, ArrowRightCircle } from "./Icons"
import { getDaysBetween } from "../../frontend/src/util/tools"
import { SYSTEM_DATE_FORMAT } from "../../backend/src/util/constants"
import classNames from "classnames"
import { useEffect, useMemo, useState } from "preact/hooks"
import { Moment } from "moment"
import { getMoment, parseMoment } from "./util/dates"
import { AvailableDate } from "./models/AvailableDate"
import { WidgetSettings } from "./models/WidgetSettings"

interface Props {
	onSelect: (value: string) => void
	availableDates: AvailableDate[]
	settings: WidgetSettings
	selectedDate: string
	hasFormError?: boolean
}

export default function Calendar({ availableDates, settings, selectedDate, onSelect, hasFormError }: Props) {
	const getMonthStart = () => {
		return selectedDate
			? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT).startOf("month")
			: (availableDates || []).length > 0
				? parseMoment(settings, availableDates[0].date, SYSTEM_DATE_FORMAT).startOf("month")
				: getMoment(settings).startOf("month")
	}

	const [monthStart, setMonthStart] = useState<Moment>(getMonthStart())

	const availableDatesSet = useMemo(() => {
		return new Set(availableDates
			.filter(ad => !ad.isSoldOut)
			.map(ad => ad.date)
		)
	}, [availableDates])

	const currentMonth = monthStart.month()
	const calendarStart = monthStart.clone().startOf("week")
	const calendarEnd = monthStart.clone().endOf("month").endOf("week")

	const moveMonth = (delta) => () => {
		const newMonthStart = monthStart.clone().add(delta, "months")
		setMonthStart(newMonthStart)
	}

	useEffect(() => setMonthStart(getMonthStart()), [settings])

	return (
		<div className={classNames("buuntoCal", { "buunto-error": hasFormError })}>
			<div className="buuntoCal-header-wrapper">
				<div className="buuntoCal-header">
					<div className="buuntoCal-previous" onClick={moveMonth(-1)}><ArrowLeftCircle/></div>
					<div className="buuntoCal-month">{monthStart.format("MMMM YYYY")}</div>
					<div className="buuntoCal-next" onClick={moveMonth(1)}><ArrowRightCircle/></div>
				</div>
			</div>
			<div className="buuntoCal-day-names">
				{getDaysBetween(calendarStart, calendarStart.clone().endOf("week"), "day").map((day) => (
					<div className="buuntoCal-day-name" key={"day" + day.format("YYYY-MM-DD")}>{day.format("dd")}</div>
				))}
			</div>
			<div className="buuntoCal-body">
				{getDaysBetween(calendarStart, calendarEnd, "week").map((weekStart) => (
					<div className="buuntoCal-week-wrapper" key={"week" + weekStart.format(SYSTEM_DATE_FORMAT)}>
						<div className="buuntoCal-week">
							{getDaysBetween(weekStart, weekStart.clone().endOf("week"), "day").map((day) => {
								const strDay = day.format(SYSTEM_DATE_FORMAT)
								const dateIsAvailable = availableDatesSet.has(strDay)
								const isCurrentMonth = day.month() == currentMonth
								const isSelected = isCurrentMonth && strDay == selectedDate
								return <div
									className={classNames("buuntoCal-day", {
										"buuntoCal-unavailable": isCurrentMonth && !dateIsAvailable,
										"buuntoCal-available": isCurrentMonth && dateIsAvailable,
										"buuntoCal-selected": isSelected
									})}
									key={"day" + strDay}
									onClick={dateIsAvailable ? () => {
										onSelect(isSelected ? undefined : strDay)
									} : () => {
									}}>
									<span>{isCurrentMonth ? day.format("D") : ""}</span>
								</div>
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
