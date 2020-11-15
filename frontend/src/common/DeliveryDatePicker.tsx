import React, { useMemo, useState } from "react"
import { Checkbox, DatePicker, Range } from "@shopify/polaris"
import moment, { Moment } from "moment"
import { CalendarMonth } from "../models/CalendarMonth"

interface Props {
	selectedDates: Moment[]
	onDatesSelected: (dates: Moment[]) => void
}

function toRangeOrDates(allowRange: boolean, selectedDates: Moment[]): Range | Date | undefined {
	if (selectedDates.length == 0) {
		return undefined
	}
	if (allowRange) {
		return {
			start: selectedDates[0].toDate(),
			end: selectedDates[selectedDates.length - 1].toDate()
		} as Range
	} else {
		return selectedDates[0].toDate() as Date
	}
}

export default function DeliveryDatePicker({ selectedDates, onDatesSelected }: Props) {
	const defaultDate = useMemo<Moment>(() => selectedDates[0], [selectedDates])

	const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>({
		month: defaultDate.month(),
		year: defaultDate.year()
	})
	const [allowRange, setAllowRange] = useState(false)

	const handleDatesSelected = (range: Range) => {
		const rangeStart = moment(range.start)
		const rangeEnd = moment(range.end)
		const dates = [] as Moment[]
		for (let cursor = rangeStart.clone(); !cursor.isAfter(rangeEnd); cursor.add(1, "day")) {
			dates.push(cursor.clone())
		}
		onDatesSelected(dates)
	}

	return (
		<div className="deliveryDatePicker">
			<div className="field">
				<DatePicker
					month={calendarMonth.month}
					year={calendarMonth.year}
					onMonthChange={(month, year) => setCalendarMonth({ month, year })}
					onChange={handleDatesSelected}
					selected={toRangeOrDates(allowRange, selectedDates)}
					allowRange={allowRange}
				/>
			</div>
			<div className="field">
				<Checkbox label="Allow to select multiple days" checked={allowRange} onChange={setAllowRange} />
			</div>
		</div>
	)
}
