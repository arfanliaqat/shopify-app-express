import React from "react"
import { Card, Checkbox, FormLayout, Select, SelectOption } from "@shopify/polaris"
import ColorPickerField from "./ColorPickerField"
import { PickerType, WidgetSettings, WidgetStyles } from "../../../widget/src/models/WidgetSettings"
import { isStockByDateApp } from "../common/constants"

export const datePickerLanguages: SelectOption[] = [
	{ value: "nl", label: "Dutch" },
	{ value: "en", label: "English (United States)" },
	{ value: "en-au", label: "English (Australia)" },
	{ value: "en-ca", label: "English (Canada)" },
	{ value: "en-gb", label: "English (United Kingdom)" },
	{ value: "fr", label: "French" },
	{ value: "fr-ca", label: "French (Canada)" },
	{ value: "de", label: "German" },
	{ value: "id", label: "Indonesian" },
	{ value: "it", label: "Italian" },
	{ value: "pl", label: "Polish" },
	{ value: "pt", label: "Portuguese" },
	{ value: "pt-br", label: "Portuguese (Brazil)" },
	{ value: "ro", label: "Romanian" },
	{ value: "ru", label: "Russian" },
	{ value: "es", label: "Spanish" },
	{ value: "sv", label: "Swedish" }
]

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function DatePickerSettingsCard({ widgetSettings, onWidgetSettingsChange }: Props) {
	const handleDatePickerTypeChange = (pickerType: PickerType) => {
		onWidgetSettingsChange({ ...widgetSettings, pickerType })
	}

	const handleLanguageChange = (locale: string) => {
		onWidgetSettingsChange({ ...widgetSettings, locale })
	}

	const handleMandatoryDateSelectChange = (mandatoryDateSelect: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, mandatoryDateSelect })
	}

	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	return (
		<Card title="Date picker settings" sectioned>
			<FormLayout>
				<FormLayout.Group>
					<Select
						label="Type"
						options={[
							{ value: "CALENDAR", label: "Calendar" },
							{ value: "DROPDOWN", label: "Dropdown" }
						]}
						value={widgetSettings.pickerType}
						onChange={handleDatePickerTypeChange}
					/>

					<Select
						label="Calendar language & date format"
						options={datePickerLanguages}
						value={widgetSettings.locale}
						onChange={(value) => handleLanguageChange(value)}
					/>
				</FormLayout.Group>

				<FormLayout.Group>
					<ColorPickerField
						label="Error font color"
						onChange={handleWidgetStyleChange("errorFontColor")}
						value={widgetSettings.styles.errorFontColor}
					/>
				</FormLayout.Group>

				{isStockByDateApp && (
					<FormLayout.Group>
						<Checkbox
							label="A date must be selected to be able to add a product to the cart"
							checked={widgetSettings.mandatoryDateSelect}
							onChange={(value) => handleMandatoryDateSelectChange(value)}
						/>
					</FormLayout.Group>
				)}
			</FormLayout>
		</Card>
	)
}
