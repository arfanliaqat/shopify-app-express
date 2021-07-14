import React from "react"
import { Card, FormLayout, TextField } from "@shopify/polaris"
import { WidgetMessages, WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { isStockByDateApp } from "../common/constants"
import {
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_DAY_OF_WEEK_TAG_LABEL,
	DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_NO_TIME_SLOT_SELECTED_ERROR,
	DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE,
	DEFAULT_TIME_SLOT_LABEL,
	DEFAULT_TIME_SLOT_TAG_LABEL
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
			<Card.Section>
				<FormLayout>
					{widgetSettings.timeSlotsEnabled && (
						<TextField
							label="Time slot label"
							maxLength={300}
							onChange={handleWidgetMessageChange("timeSlotLabel")}
							value={widgetSettings.messages.timeSlotLabel ?? DEFAULT_TIME_SLOT_LABEL}
						/>
					)}
					{widgetSettings.timeSlotsEnabled && widgetSettings.dateDeselectedFirst && (
						<TextField
							label="Time slot dropdown default option"
							maxLength={300}
							onChange={handleWidgetMessageChange("timeSlotDropdownDefaultOptionLabel")}
							value={
								widgetSettings.messages.timeSlotDropdownDefaultOptionLabel ??
								DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL
							}
						/>
					)}
					{widgetSettings.timeSlotsEnabled && widgetSettings.mandatoryTimeSlot && (
						<TextField
							label="No time slot selected error"
							maxLength={300}
							onChange={handleWidgetMessageChange("noTimeSlotSelectedError")}
							value={
								widgetSettings.messages.noTimeSlotSelectedError ?? DEFAULT_NO_TIME_SLOT_SELECTED_ERROR
							}
						/>
					)}
					{widgetSettings.timeSlotsEnabled && (
						<TextField
							label="Order tag time slot label"
							maxLength={300}
							onChange={handleWidgetMessageChange("timeSlotTagLabel")}
							value={widgetSettings.messages.timeSlotTagLabel ?? DEFAULT_TIME_SLOT_TAG_LABEL}
						/>
					)}
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
