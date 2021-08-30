import React from "react"
import TimeSlotsCard from "./timeSlots/TimeSlotCard"
import SettingsLayoutWithPreview from "./SettingsLayoutWithPreview"

interface Props {
	onChange: (hasChanges: boolean) => void
}

export default function TimeSlotsPanel({ onChange }: Props) {
	return (
		<SettingsLayoutWithPreview onChange={onChange}>
			<TimeSlotsCard />
		</SettingsLayoutWithPreview>
	)
}
