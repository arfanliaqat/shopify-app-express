import React from "react"
import { Card, FormLayout, TextField, ChoiceList } from "@shopify/polaris"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { allWeekDays } from "../../../backend/src/util/constants"
import { capitalize } from "../util/tools"

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

	const handleAvailableWeekDaysChange = (value: string[]) => {
		onWidgetSettingsChange({ ...widgetSettings, availableWeekDays: value })
	}

	return (
		<Card title="Availability settings">
			<Card.Section>
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
			</Card.Section>
			<Card.Section>
				<div className="availableDaysField">
					<ChoiceList
						allowMultiple
						title="Available days"
						choices={allWeekDays.map((day) => ({
							label: capitalize(day),
							value: day
						}))}
						selected={widgetSettings.availableWeekDays}
						onChange={handleAvailableWeekDaysChange}
					/>
				</div>
			</Card.Section>
		</Card>
	)
}
