import React from "react"
import { Card, FormLayout, TextField } from "@shopify/polaris"
import { WidgetMessages, WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { isStockByDateApp } from "../common/constants"
import {
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_DAY_OF_WEEK_TAG_LABEL,
	DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE
} from "../../../backend/src/util/constants"

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
								widgetSettings.messages.dropdownDefaultOptionLabel ??
								DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL
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
					<TextField
						label="Order tag date label"
						maxLength={300}
						onChange={handleWidgetMessageChange("dateTagLabel")}
						value={widgetSettings.messages.dateTagLabel ?? DEFAULT_DATE_TAG_LABEL}
					/>
					<TextField
						label="Order tag day of week label"
						maxLength={300}
						onChange={handleWidgetMessageChange("dayOfWeekTagLabel")}
						value={widgetSettings.messages.dayOfWeekTagLabel ?? DEFAULT_DAY_OF_WEEK_TAG_LABEL}
					/>
					{widgetSettings.singleDatePerOrder && (
						<TextField
							label="Message when a date have already been selected in the order"
							maxLength={300}
							onChange={handleWidgetMessageChange("singleDatePerOrderMessage")}
							value={
								widgetSettings.messages.singleDatePerOrderMessage ??
								DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE
							}
						/>
					)}
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
