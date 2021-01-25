import { SYSTEM_DATE_FORMAT, TAG_DATE_FORMAT, TAG_LABEL } from "../../backend/src/util/constants"
import moment from "moment"
import { h } from "preact"
import { AvailableDate } from "./models/AvailableDate"

interface Props {
	onSelect: (value: string) => void,
	availableDates: AvailableDate[],
	selectedAvailableDate: string
}

export default function DropdownDatePicker({ onSelect, availableDates, selectedAvailableDate }: Props) {
	const handleSelect = (e) => {
		if (e.target.value) {
			onSelect(e.target.value)
		} else {
			onSelect(undefined)
		}
	}

	return <select name={`properties[${TAG_LABEL}]`} onChange={handleSelect} style={{ width: "100%" }}>
		{availableDates.map((availableDate) => {
			const momentDate = moment(availableDate.date, SYSTEM_DATE_FORMAT)
			const valueDate = momentDate.format(TAG_DATE_FORMAT)
			return <option value={valueDate} disabled={availableDate.isSoldOut}
						   selected={valueDate == selectedAvailableDate}>
				{momentDate.format("dddd D MMMM")}
				{availableDate.isSoldOut ? " (sold out)" : ""}
			</option>
		})}
	</select>
}
