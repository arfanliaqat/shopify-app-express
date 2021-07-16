import { h, Fragment } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { ArrowLeftCircle, ArrowRightCircle } from "./Icons"
import { getDaysBetween } from "../../frontend/src/util/tools"
import { Moment } from "moment"
import { useEffect, useMemo, useState } from "preact/hooks"
import {
	DAY_OF_WEEK_TAG_DATE_FORMAT,
	SYSTEM_DATE_FORMAT,
	TAG_DATE_FORMAT,
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_DAY_OF_WEEK_TAG_LABEL
} from "../../backend/src/util/constants"
import classNames from "classnames"
import { WidgetSettings } from "./models/WidgetSettings"
import { getMoment, parseMoment } from "./util/dates"
import { FormAttributeName } from "./AvailableDatePicker"

interface Props {
	onSelect: (value: string) => void
	availableDates: AvailableDate[]
	settings: WidgetSettings
	formError: string | undefined
	formAttributeName: FormAttributeName
}

export default function CalendarDatePicker({ availableDates, settings, onSelect, formError, formAttributeName }: Props) {

	const getMonthStart = () => {
		return momentSelectedDate ? momentSelectedDate.clone().startOf("month") : getMoment(settings).startOf("month")
	}

	const [selectedDate, setSelectedDate] = useState<string | undefined>(
		settings.dateDeselectedFirst ? undefined : availableDates[0]?.date
	)
	const momentSelectedDate = availableDates[0] ? parseMoment(settings, availableDates[0].date, SYSTEM_DATE_FORMAT) : undefined
	const [monthStart, setMonthStart] = useState<Moment>(getMonthStart())

	const currentMonth = monthStart.month()
	const calendarStart = monthStart.clone().startOf("week")
	const calendarEnd = monthStart.clone().endOf("month").endOf("week")

	useEffect(() => {
		setSelectedDate(settings.dateDeselectedFirst ? undefined : availableDates[0]?.date)
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

	const dateTagLabel = settings.messages.dateTagLabel || DEFAULT_DATE_TAG_LABEL
	const dayOfWeekTagLabel = settings.messages.dayOfWeekTagLabel || DEFAULT_DAY_OF_WEEK_TAG_LABEL

	return <Fragment>
		{formError && <div className="buunto-error-message">{formError}</div>}
		<div className={classNames("buuntoCal", { "buunto-error": !!formError })}>
			{formattedSelectedDate &&
            <input type="hidden" name={`${formAttributeName}[${dateTagLabel}]`} value={formattedSelectedDate}/>}
			{formattedSelectedDay &&
            <input type="hidden" name={`${formAttributeName}[${dayOfWeekTagLabel}]`} value={formattedSelectedDay}/>}
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
										handleDateSelect(isSelected ? undefined : strDay)
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
	</Fragment>
}
