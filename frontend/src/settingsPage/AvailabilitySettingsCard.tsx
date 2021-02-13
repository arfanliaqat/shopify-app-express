import React from "react"
import { Card, FormLayout, TextField } from "@shopify/polaris"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function AvailabilitySettingsCard({ widgetSettings, onWidgetSettingsChange }: Props) {
	const handleFirstAvailableDateInDays = (value: string) => {
		onWidgetSettingsChange({ ...widgetSettings, firstAvailableDateInDays: parseInt(value) })
	}

	const handleLastAvailableDateInWeeks = (value: string) => {
		onWidgetSettingsChange({ ...widgetSettings, lastAvailableDateInWeeks: parseInt(value) })
	}

	return (
		<Card title="Availability settings" sectioned>
			<FormLayout>
				<FormLayout.Group>
					<TextField
						type="number"
						label="First available date"
						onChange={handleFirstAvailableDateInDays}
						suffix="days from today"
						value={widgetSettings.firstAvailableDateInDays + ""}
						min={0}
						max={19}
					/>

					<TextField
						type="number"
						label="Last available date"
						onChange={handleLastAvailableDateInWeeks}
						suffix="weeks from today"
						value={widgetSettings.lastAvailableDateInWeeks + ""}
						min={1}
						max={20}
					/>
				</FormLayout.Group>
			</FormLayout>
		</Card>
	)
}
