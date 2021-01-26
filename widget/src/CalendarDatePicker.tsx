import { h } from "preact"
import { AvailableDate } from "./models/AvailableDate"

interface Props {
	onSelect: (value: string) => void,
	availableDates: AvailableDate[],
	selectedAvailableDate: string
}
export default function CalendarDatePicker({}: Props) {
	return <div className="h10-calendar">
		CALENDAR
	</div>
}
