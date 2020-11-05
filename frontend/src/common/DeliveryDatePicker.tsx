import React, { useCallback, useMemo, useState } from "react"
import { Checkbox, DatePicker, Range } from "@shopify/polaris"
import moment from "moment"
import { CalendarMonth } from "../models/CalendarMonth"

interface Props {
	selectedDates: Date[]
	onDatesSelected: (dates: Date[]) => void
}

function toRangeOrDates(allowRange: boolean, selectedDates: Date[]): Range | Date | undefined {
	if (selectedDates.length == 0) {
		return undefined
	}
	if (allowRange) {
		return {
			start: selectedDates[0],
			end: selectedDates[selectedDates.length - 1]
		} as Range
	} else {
		return selectedDates[0] as Date
	}
}

export default function DeliveryDatePicker({ selectedDates, onDatesSelected }: Props) {
	const defaultDate = useMemo<Date>(() => selectedDates[0], [])

	const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>({
		month: defaultDate.getMonth(),
		year: defaultDate.getFullYear()
	})
	const [allowRange, setAllowRange] = useState(false)

	const handleDatesSelected = useCallback((range: Range) => {
		const rangeStart = moment(range.start)
		const rangeEnd = moment(range.end)
		const dates = [] as Date[]
		for (let cursor = rangeStart.clone(); !cursor.isAfter(rangeEnd); cursor.add(1, "day")) {
			dates.push(cursor.toDate())
		}
		onDatesSelected(dates)
	}, [])

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
