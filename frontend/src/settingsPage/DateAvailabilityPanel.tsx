import React from "react"
import AvailableDatesPanel from "./AvailabilitySettingsCard"
import SettingsLayoutWithPreview from "./SettingsLayoutWithPreview"

interface Props {
	onChange: (hasChanges: boolean) => void
}

export default function DateAvailabilityPanel({ onChange }: Props) {
	return (
		<SettingsLayoutWithPreview onChange={onChange}>
			<AvailableDatesPanel />
		</SettingsLayoutWithPreview>
	)
}
