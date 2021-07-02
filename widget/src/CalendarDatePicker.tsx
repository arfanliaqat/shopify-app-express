import { h } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { ArrowLeftCircle, ArrowRightCircle } from "./Icons"
import { getDaysBetween } from "../../frontend/src/util/tools"
import { Moment } from "moment"
import { useEffect, useMemo, useState } from "preact/hooks"
import {
	DAY_OF_WEEK_TAG_DATE_FORMAT,
	DAY_OF_WEEK_TAG_LABEL,
	SYSTEM_DATE_FORMAT,
	TAG_DATE_FORMAT,
	TAG_LABEL
} from "../../backend/src/util/constants"
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

	const [selectedDate, setSelectedDate] = useState<string | undefined>(
		settings.mandatoryDateSelect ? availableDates[0]?.date : undefined
	)
	const momentSelectedDate = selectedDate ? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT) : undefined
	const [monthStart, setMonthStart] = useState<Moment>(getMonthStart())

	const currentMonth = monthStart.month()
	const calendarStart = monthStart.clone().startOf("week")
	const calendarEnd = monthStart.clone().endOf("month").endOf("week")

	useEffect(() => {
		setSelectedDate(settings.mandatoryDateSelect ? availableDates[0]?.date : undefined)
	}, [availableDates])

	const availableDatesSet = useMemo(() => {
		return new Set(availableDates
			.filter(ad => !ad.isSoldOut)
			.map(ad => ad.date)
		)
	}, [availableDates])

	const formattedSelectedDate = useMemo(() => {
		return selectedDate ? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT)?.format(TAG_DATE_FORMAT) : undefined
	}, [settings, selectedDate])

	const formattedSelectedDay = useMemo(() => {
		return selectedDate ? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT)?.format(DAY_OF_WEEK_TAG_DATE_FORMAT) : undefined
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

	return <div className="buuntoCal">
		{formattedSelectedDate && <input type="hidden" name={`properties[${TAG_LABEL}]`} value={formattedSelectedDate}/>}
		{formattedSelectedDay && <input type="hidden" name={`properties[${DAY_OF_WEEK_TAG_LABEL}]`} value={formattedSelectedDay}/>}
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
								onClick={dateIsAvailable ? () => handleDateSelect(isSelected ? undefined : strDay) : () => {}}>
								<span>{isCurrentMonth ? day.format("D") : ""}</span>
							</div>
						})}
					</div>
				</div>
			))}
		</div>
	</div>
}
