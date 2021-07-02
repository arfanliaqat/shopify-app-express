import React from "react"
import { Card, FormLayout, TextField } from "@shopify/polaris"
import { WidgetMessages, WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { isStockByDateApp } from "../common/constants"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function MessagesCard({ widgetSettings, onWidgetSettingsChange }: Props) {
	const handleWidgetMessageChange = (key: keyof WidgetMessages) => (value: string) => {
		const messages: WidgetMessages = { ...widgetSettings.messages, [key]: value }
		onWidgetSettingsChange({ ...widgetSettings, messages })
	}

	return (
		<Card title="Messages">
			<Card.Section>
				<FormLayout>
					<TextField
						label="Date picker label"
						maxLength={300}
						onChange={handleWidgetMessageChange("datePickerLabel")}
						value={widgetSettings.messages.datePickerLabel}
					/>
					<TextField
						label="No date selected error"
						maxLength={300}
						onChange={handleWidgetMessageChange("noDateSelectedError")}
						value={widgetSettings.messages.noDateSelectedError}
					/>
					<TextField
						label="No available dates error"
						maxLength={300}
						onChange={handleWidgetMessageChange("noAvailableDatesError")}
						value={widgetSettings.messages.noAvailableDatesError}
					/>
					{widgetSettings.pickerType == "DROPDOWN" && (
						<TextField
							label="Dropdown default option label"
							maxLength={300}
							onChange={handleWidgetMessageChange("dropdownDefaultOptionLabel")}
							value={
								widgetSettings.messages.dropdownDefaultOptionLabel === undefined
									? "Please select..."
									: widgetSettings.messages.dropdownDefaultOptionLabel
							}
						/>
					)}
					{isStockByDateApp && widgetSettings.pickerType == "DROPDOWN" && (
						<TextField
							label="Sold out"
							maxLength={100}
							onChange={handleWidgetMessageChange("soldOut")}
							value={widgetSettings.messages.soldOut}
						/>
					)}
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
