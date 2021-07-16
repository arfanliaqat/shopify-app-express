import React from "react"
import { Card, Checkbox, FormLayout, Select } from "@shopify/polaris"
import ColorPickerField from "./ColorPickerField"
import { PickerType, WidgetSettings, WidgetStyles } from "../../../widget/src/models/WidgetSettings"
import { datePickerLanguages, defaultWidgetStyles } from "../../../backend/src/util/constants"

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

	const handleDateDeselectedFirstChange = (dateUnselectedFirst: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, dateDeselectedFirst: dateUnselectedFirst })
	}

	const handleSingleDatePerOrderChange = (singleDatePerOrder: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, singleDatePerOrder })
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

				<ColorPickerField
					label="Error font color"
					onChange={handleWidgetStyleChange("errorFontColor")}
					value={widgetSettings.styles.errorFontColor}
				/>

				<ColorPickerField
					label="Error border color"
					onChange={handleWidgetStyleChange("errorBorderColor")}
					value={widgetSettings.styles.errorBorderColor ?? defaultWidgetStyles.errorBorderColor}
				/>

				<Checkbox
					label="A date must be selected to be able to add a product to the cart"
					checked={widgetSettings.mandatoryDateSelect}
					onChange={(value) => handleMandatoryDateSelectChange(value)}
				/>

				<Checkbox
					label="The date appears deselected at first"
					checked={widgetSettings.dateDeselectedFirst}
					onChange={(value) => handleDateDeselectedFirstChange(value)}
				/>

				<Checkbox
					label="Only allow to select one date per order"
					checked={widgetSettings.singleDatePerOrder}
					onChange={(value) => handleSingleDatePerOrderChange(value)}
				/>
			</FormLayout>
		</Card>
	)
}
