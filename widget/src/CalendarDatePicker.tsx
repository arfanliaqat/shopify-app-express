import { h } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { ArrowLeftCircle, ArrowRightCircle } from "./Icons"
import { getDaysBetween } from "../../frontend/src/util/tools"
import moment from "moment"
import { useMemo, useState } from "preact/hooks"
import { SYSTEM_DATE_FORMAT } from "../../backend/src/util/constants"
import classNames from "classnames"

interface Props {
	onSelect: (value: string) => void,
	availableDates: AvailableDate[],
	selectedAvailableDate: string
}

export default function CalendarDatePicker({ availableDates }: Props) {
	const monthStart = moment().startOf("month")
	const currentMonth = monthStart.month()
	const calendarStart = monthStart.clone().startOf("week")
	const calendarEnd = moment().endOf("month").endOf("week")
	const availableDatesSet = useMemo(() => new Set(availableDates.map(ad => ad.date)), [availableDates])
	const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]?.date)
	return <div className="h10cal">
		<div className="h10cal-header-wrapper">
			<div className="h10cal-header">
				<div className="h10cal-previous"><ArrowLeftCircle/></div>
				<div className="h10cal-month">{monthStart.format("MMMM YYYY")}</div>
				<div className="h10cal-next"><ArrowRightCircle/></div>
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
							return <div
								className={classNames("h10cal-day", {
									"h10cal-available": dateIsAvailable,
									"h10cal-selected": strDay == selectedDate
								})}
								key={"day" + strDay}
								onClick={dateIsAvailable ? () => setSelectedDate(strDay) : () => {}}>
								<span>{day.month() == currentMonth ? day.format("D") : ""}</span>
							</div>
						})}
					</div>
				</div>
			))}
		</div>
	</div>
}
