import { h } from "preact"
import { ConfigDay, TimeSlot, TimeSlotsByDay, WidgetSettings } from "./models/WidgetSettings"
import {
	DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_TIME_SLOT_LABEL,
	DEFAULT_TIME_SLOT_TAG_LABEL,
} from "../../backend/src/util/constants"
import classNames from "classnames"
import { FormAttributeName } from "./AvailableDatePicker"
import { toTimeSlotDisplay } from "./util/dates"

interface Props {
	settings: WidgetSettings
	selectedTimeSlot: string | undefined
	onSelect: (value: string | undefined) => void
	formError: string | undefined
	configDay: ConfigDay
	formAttributeName: FormAttributeName
	formId:  string | undefined
}

export function getTimeSlotsByConfigDay(timeSlotsByDay: TimeSlotsByDay | undefined, configDay: ConfigDay): TimeSlot[] {
	if (timeSlotsByDay) {
		if ((timeSlotsByDay[configDay] || []).length == 0) {
			return timeSlotsByDay["DEFAULT"]
		} else {
			return timeSlotsByDay[configDay] || []
		}
	}
	return []
}

export default function TimeSlotPicker({ settings, selectedTimeSlot, onSelect, formError, configDay, formAttributeName, formId }: Props) {

	const dropdownDefaultOptionLabel = settings.messages.timeSlotDropdownDefaultOptionLabel || DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL
	const timeSlotLabel = settings.messages.timeSlotLabel || DEFAULT_TIME_SLOT_LABEL
	const timeSlotTagLabel = settings.messages.timeSlotTagLabel || DEFAULT_TIME_SLOT_TAG_LABEL

	let timeSlots = getTimeSlotsByConfigDay(settings.timeSlotsByDay, configDay)

	return (
		<div className="buunto-time-slot-picker">
			<div className="buunto-time-slot-picker-label">{timeSlotLabel}</div>
			{formError && <div className="buunto-error-message">{formError}</div>}
			<div className="buunto-field">
				<select className={classNames("buunto-time-slot-picker-dropdown", "buunto-dropdown", { "buunto-error": !!formError })}
						name={`${formAttributeName}[${timeSlotTagLabel}]`}
						onChange={e => onSelect((e?.target as any)?.value)}
						form={formId}>
					{settings.timeSlotDeselectedFirst && <option value="">{dropdownDefaultOptionLabel}</option>}
					{timeSlots.map((timeSlot) => {
						const timeSlotDisplay = toTimeSlotDisplay(settings, timeSlot)
						return <option value={timeSlotDisplay} selected={timeSlotDisplay == selectedTimeSlot}>
							{timeSlotDisplay}
						</option>
					})}
				</select>
			</div>
		</div>
	)
}
