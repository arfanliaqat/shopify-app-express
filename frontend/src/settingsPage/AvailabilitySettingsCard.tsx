import React from "react"
import { Card, FormLayout, TextField, ChoiceList, Select } from "@shopify/polaris"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { allWeekDays } from "../../../backend/src/util/constants"
import { capitalize } from "../util/tools"
import DisabledDates from "./DisabledDates"
import { SelectOption } from "@shopify/polaris/dist/types/latest/src/components/Select/Select"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

function getTextFromFirstAvailableDateInDays(days: number) {
	if (days == 0) {
		return "today"
	} else if (days == 1) {
		return "tomorrow"
	} else {
		return days + " days after today"
	}
}

function getCutOffTimeOptions() {
	const options = [] as SelectOption[]
	for (let i = 0; i < 24; i++) {
		const value = (i < 10 ? "0" + i : i) + ":00"
		options.push({ value, label: value })
	}
	options.push({ value: "23:59", label: "23:59" })
	return options
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

	const handleDisabledDatesChange = (value: string[]) => {
		onWidgetSettingsChange({ ...widgetSettings, disabledDates: value })
	}

	const handleCutOffTimeChange = (value: string) => {
		onWidgetSettingsChange({ ...widgetSettings, cutOffTime: value })
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
							helpText={`The first date available will be ${getTextFromFirstAvailableDateInDays(
								widgetSettings.firstAvailableDateInDays
							)}`}
						/>
						<Select
							label="Cut off time"
							onChange={handleCutOffTimeChange}
							options={getCutOffTimeOptions()}
							helpText="Time after witch the first available date becomes unavailable"
							value={widgetSettings.cutOffTime}
						/>
					</FormLayout.Group>
					<FormLayout.Group>
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
			<Card.Section>
				<DisabledDates dates={widgetSettings.disabledDates || []} onChange={handleDisabledDatesChange} />
			</Card.Section>
		</Card>
	)
}
