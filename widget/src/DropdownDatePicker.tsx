import { SYSTEM_DATE_FORMAT, TAG_DATE_FORMAT, TAG_LABEL } from "../../backend/src/util/constants"
import moment from "moment"
import { h } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { WidgetSettings } from "./models/WidgetSettings"

interface Props {
	onSelect: (value: string) => void,
	availableDates: AvailableDate[],
	selectedAvailableDate: string,
	settings: WidgetSettings
}

export default function DropdownDatePicker({ settings, onSelect, availableDates, selectedAvailableDate }: Props) {
	const handleSelect = (e) => {
		if (e.target.value) {
			onSelect(e.target.value)
		} else {
			onSelect(undefined)
		}
	}

	return <select className="h10-dropdown" name={`properties[${TAG_LABEL}]`} onChange={handleSelect}>
		{availableDates.map((availableDate) => {
			const momentDate = moment(availableDate.date, SYSTEM_DATE_FORMAT)
			const valueDate = momentDate.format(TAG_DATE_FORMAT)
			return <option value={valueDate} disabled={availableDate.isSoldOut}
						   selected={valueDate == selectedAvailableDate}>
				{momentDate.format(settings.dropdownDateFormat)}
				{availableDate.isSoldOut ? ` (${settings.messages.soldOut})` : ""}
			</option>
		})}
	</select>
}
