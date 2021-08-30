import React from "react"
import WidgetCustomizationForm from "./WidgetCustomizationForm"
import SettingsLayoutWithPreview from "./SettingsLayoutWithPreview"

interface Props {
	onChange: (hasChanges: boolean) => void
}

export default function WidgetCustomizationPanel({ onChange }: Props) {
	return (
		<SettingsLayoutWithPreview onChange={onChange}>
			<WidgetCustomizationForm />
		</SettingsLayoutWithPreview>
	)
}
