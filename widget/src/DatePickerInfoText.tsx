import { h } from "preact"
import { WidgetSettings } from "./models/WidgetSettings"

interface Props {
	settings: WidgetSettings
}

export default function DatePickerInfoText({ settings }: Props) {
	if (settings.messages.datePickerInfoText) {
		return <div className="buunto-info-message">{settings.messages.datePickerInfoText}</div>
	}
	return undefined
}
