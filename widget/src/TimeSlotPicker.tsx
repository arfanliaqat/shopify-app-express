import { h } from "preact"
import { ConfigDay, WidgetSettings } from "./models/WidgetSettings"
import {
	DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_TIME_SLOT_LABEL,
	DEFAULT_TIME_SLOT_TAG_LABEL,
} from "../../backend/src/util/constants"
import classNames from "classnames"

interface Props {
	settings: WidgetSettings
	selectedTimeSlot: string | undefined
	onSelect: (value: string | undefined) => void
	formError: string | undefined
	configDay: ConfigDay
}

export default function TimeSlotPicker({ settings, selectedTimeSlot, onSelect, formError, configDay }: Props) {

	const dropdownDefaultOptionLabel = settings.messages.timeSlotDropdownDefaultOptionLabel || DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL
	const timeSlotLabel = settings.messages.timeSlotLabel || DEFAULT_TIME_SLOT_LABEL
	const timeSlotTagLabel = settings.messages.timeSlotTagLabel || DEFAULT_TIME_SLOT_TAG_LABEL

	let timeSlots = []
	if (settings.timeSlotsByDay) {
		if ((settings.timeSlotsByDay[configDay] || []).length == 0) {
			timeSlots = settings.timeSlotsByDay["DEFAULT"]
		} else {
			timeSlots = settings.timeSlotsByDay[configDay] || []
		}
	}

	return (
		<div className="buunto-time-slot-picker">
			<div className="buunto-time-slot-picker-label">{timeSlotLabel}</div>
			{formError && <div className="buunto-error-message">{formError}</div>}
			<select className={classNames("buunto-time-slot-picker-dropdown", "buunto-dropdown", { "buunto-error": !!formError })}
					name={`properties[${timeSlotTagLabel}]`}
					onChange={e => onSelect((e?.target as any)?.value)}>
				{settings.timeSlotDeselectedFirst && <option value="">{dropdownDefaultOptionLabel}</option>}
				{timeSlots.map((timeSlot) => {
					const timeSlotValue = `${timeSlot.from} - ${timeSlot.to}`
					return <option value={timeSlotValue} selected={timeSlotValue == selectedTimeSlot}>
						{timeSlotValue}
					</option>
				})}
			</select>
		</div>
	)
}
