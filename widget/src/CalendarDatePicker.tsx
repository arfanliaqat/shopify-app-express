import { h } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { ArrowLeftCircle, ArrowRightCircle } from "./Icons"
import { getDaysBetween } from "../../frontend/src/util/tools"
import { Moment } from "moment"
import { useEffect, useMemo, useState } from "preact/hooks"
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


export default function CalendarDatePicker({ availableDates, settings, onSelect }: Props) {

	const getMonthStart = () => {
		return momentSelectedDate ? momentSelectedDate.clone().startOf("month") : getMoment(settings).startOf("month")
	}

	const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]?.date)
	const momentSelectedDate = selectedDate ? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT) : undefined
	const [monthStart, setMonthStart] = useState<Moment>(getMonthStart())

	const currentMonth = monthStart.month()
	const calendarStart = monthStart.clone().startOf("week")
	const calendarEnd = monthStart.clone().endOf("month").endOf("week")

	useEffect(() => {
		setSelectedDate(availableDates[0]?.date)
	}, [availableDates])

	const availableDatesSet = useMemo(() => {
		return new Set(availableDates
			.filter(ad => !ad.isSoldOut)
			.map(ad => ad.date)
		)
	}, [availableDates])

	const formattedSelectedDate = useMemo(() => {
		return parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT)?.format(TAG_DATE_FORMAT)
	}, [settings, selectedDate])

	useEffect(() => setMonthStart(getMonthStart()), [settings])

	const moveMonth = (delta) => () => {
		const newMonthStart = monthStart.clone().add(delta, "months")
		setMonthStart(newMonthStart)
	}

	const handleDateSelect = (strDay) => {
		setSelectedDate(strDay)
		onSelect(strDay)
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
								onClick={dateIsAvailable ? () => handleDateSelect(strDay) : () => {}}>
								<span>{isCurrentMonth ? day.format("D") : ""}</span>
							</div>
						})}
					</div>
				</div>
			))}
		</div>
	</div>
}
