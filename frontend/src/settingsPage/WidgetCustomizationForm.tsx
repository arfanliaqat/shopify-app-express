import React, { useContext } from "react"
import { Layout } from "@shopify/polaris"
import DatePickerSettingsCard from "./DatePickerSettingsCard"
import CalendarStylesCard from "./CalendarStylesCard"
import DropdownStylesCard from "./DropdownStylesCard"
import { SettingsLayoutContext } from "./SettingsLayout"

interface Props {}

export default function WidgetCustomizationForm({}: Props) {
	const { widgetSettings } = useContext(SettingsLayoutContext)
	if (!widgetSettings) return null

	return (
		<Layout>
			<Layout.Section>
				<DatePickerSettingsCard />
			</Layout.Section>

			{(widgetSettings.pickerType == "CALENDAR" || widgetSettings.pickerType == "TEXT_INPUT") && (
				<Layout.Section>
					<CalendarStylesCard />
				</Layout.Section>
			)}

			{(widgetSettings.pickerType == "DROPDOWN" ||
				widgetSettings.pickerType == "TEXT_INPUT" ||
				widgetSettings.timeSlotsEnabled) && (
				<Layout.Section>
					<DropdownStylesCard />
				</Layout.Section>
			)}
		</Layout>
	)
}
