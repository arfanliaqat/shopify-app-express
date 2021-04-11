import {
	DAY_OF_WEEK_TAG_DATE_FORMAT, DAY_OF_WEEK_TAG_LABEL,
	SYSTEM_DATE_FORMAT,
	TAG_DATE_FORMAT,
	TAG_LABEL
} from "../../backend/src/util/constants"
import { h, Fragment } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { WidgetSettings } from "./models/WidgetSettings"
import { parseMoment } from "./util/dates"
import { useMemo } from "preact/hooks"

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

	const formattedSelectedDay = useMemo(() => {
		return parseMoment(settings, selectedAvailableDate, SYSTEM_DATE_FORMAT)?.format(DAY_OF_WEEK_TAG_DATE_FORMAT)
	}, [settings, selectedAvailableDate])


	return (
		<Fragment>
			<select className="h10-dropdown" name={`properties[${TAG_LABEL}]`} onChange={handleSelect}>
				{availableDates.map((availableDate) => {
					const momentDate = parseMoment(settings, availableDate.date, SYSTEM_DATE_FORMAT)
					const valueDate = momentDate.format(TAG_DATE_FORMAT)
					return <option value={valueDate} disabled={availableDate.isSoldOut}
								   selected={valueDate == selectedAvailableDate}>
						{momentDate.format("dddd, LL")}
						{availableDate.isSoldOut && settings.messages.soldOut ? ` (${settings.messages.soldOut})` : ""}
					</option>
				})}
			</select>
			<input type="hidden" name={`properties[${DAY_OF_WEEK_TAG_LABEL}]`} value={formattedSelectedDay} />
		</Fragment>
	)
}
