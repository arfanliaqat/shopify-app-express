import { h } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { ArrowLeftCircle, ArrowRightCircle } from "./Icons"
import { getDaysBetween } from "../../frontend/src/util/tools"
import { Moment } from "moment"
import {  useMemo, useState } from "preact/hooks"
import { SYSTEM_DATE_FORMAT, TAG_DATE_FORMAT, TAG_LABEL } from "../../backend/src/util/constants"
import classNames from "classnames"
import { WidgetSettings } from "./models/WidgetSettings"
import { getMoment, parseMoment } from "./util/dates"

interface Props {
	onSelect: (value: string) => void,
	availableDates: AvailableDate[],
	selectedAvailableDate: string,
	settings: WidgetSettings
}

export default function CalendarDatePicker({ availableDates, settings }: Props) {

	const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]?.date)
	const momentSelectedDate = selectedDate ? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT) : undefined
	const [monthStart, setMonthStart] = useState<Moment>(
		momentSelectedDate ? momentSelectedDate.clone().startOf("month") : getMoment(settings).startOf("month")
	)

	const currentMonth = monthStart.month()
	const calendarStart = monthStart.clone().startOf("week")
	const calendarEnd = monthStart.clone().endOf("month").endOf("week")

	const availableDatesSet = useMemo(() => new Set(availableDates.map(ad => ad.date)), [availableDates])
	const formattedSelectedDate = useMemo(() => parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT)?.format(TAG_DATE_FORMAT), [])

	const moveMonth = (delta) => () => {
		const newMonthStart = monthStart.clone().add(delta, "months")
		setMonthStart(newMonthStart)
	}

	return <div className="h10cal">
		<input type="hidden" name={`properties[${TAG_LABEL}]`} value={formattedSelectedDate} />
		<div className="h10cal-header-wrapper">
			<div className="h10cal-header">
				<div className="h10cal-previous" onClick={moveMonth(-1)}><ArrowLeftCircle/></div>
				<div className="h10cal-month">{monthStart.format("MMMM YYYY")}</div>
				<div className="h10cal-next" onClick={moveMonth(1)}><ArrowRightCircle/></div>
			</div>
		</div>
		<div className="h10cal-day-names">
			{getDaysBetween(calendarStart, calendarStart.clone().endOf("week"), "day").map((day) => (
				<div className="h10cal-day-name" key={"day" + day.format("YYYY-MM-DD")}>{day.format("dd")}</div>
			))}
		</div>
		<div className="h10cal-body">
			{getDaysBetween(calendarStart, calendarEnd, "week").map((weekStart) => (
				<div className="h10cal-week-wrapper" key={"week" + weekStart.format(SYSTEM_DATE_FORMAT)}>
					<div className="h10cal-week">
						{getDaysBetween(weekStart, weekStart.clone().endOf("week"), "day").map((day) => {
							const strDay = day.format(SYSTEM_DATE_FORMAT)
							const dateIsAvailable = availableDatesSet.has(strDay)
							const isCurrentMonth = day.month() == currentMonth
							return <div
								className={classNames("h10cal-day", {
									"h10cal-unavailable": isCurrentMonth && !dateIsAvailable,
									"h10cal-available": isCurrentMonth && dateIsAvailable,
									"h10cal-selected": isCurrentMonth && strDay == selectedDate
								})}
								key={"day" + strDay}
								onClick={dateIsAvailable ? () => setSelectedDate(strDay) : () => {}}>
								<span>{isCurrentMonth ? day.format("D") : ""}</span>
							</div>
						})}
					</div>
				</div>
			))}
		</div>
	</div>
}
