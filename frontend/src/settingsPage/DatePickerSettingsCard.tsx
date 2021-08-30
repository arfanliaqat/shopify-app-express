import React, { useContext } from "react"
import { Card, Checkbox, FormLayout, Select } from "@shopify/polaris"
import ColorPickerField from "./ColorPickerField"
import { PickerType, WidgetSettings, WidgetStyles } from "../../../widget/src/models/WidgetSettings"
import {
	datePickerLanguages,
	DEFAULT_SHOW_DAY_OF_WEEK_TAG,
	defaultWidgetStyles
} from "../../../backend/src/util/constants"
import { SettingsLayoutContext } from "./SettingsLayout"

interface Props {}

const FIELD_LABEL_BOLD = "bold"

function getFieldLabelIsBold(widgetSettings: WidgetSettings): boolean {
	return (widgetSettings.styles.fieldLabelFontWeight ?? defaultWidgetStyles.fieldLabelFontWeight) == FIELD_LABEL_BOLD
}

export default function DatePickerSettingsCard({}: Props) {
	const { widgetSettings, setWidgetSettings } = useContext(SettingsLayoutContext)
	if (!widgetSettings) return null

	const handleDatePickerTypeChange = (pickerType: PickerType) => {
		setWidgetSettings({ ...widgetSettings, pickerType })
	}

	const handleLanguageChange = (locale: string) => {
		setWidgetSettings({ ...widgetSettings, locale })
	}

	const handleMandatoryDateSelectChange = (mandatoryDateSelect: boolean) => {
		setWidgetSettings({ ...widgetSettings, mandatoryDateSelect })
	}

	const handleDateDeselectedFirstChange = (dateUnselectedFirst: boolean) => {
		setWidgetSettings({ ...widgetSettings, dateDeselectedFirst: dateUnselectedFirst })
	}

	const handleSingleDatePerOrderChange = (singleDatePerOrder: boolean) => {
		setWidgetSettings({ ...widgetSettings, singleDatePerOrder })
	}

	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	const handleShowDayOfWeekTagChange = (showDayOfWeekTag) => {
		setWidgetSettings({ ...widgetSettings, showDayOfWeekTag })
	}

	const handleFieldLabelIsBoldChange = (checked: boolean) => {
		const styles = { ...widgetSettings.styles, fieldLabelFontWeight: checked ? FIELD_LABEL_BOLD : "" }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	return (
		<Card title="Date picker settings" sectioned>
			<FormLayout>
				<FormLayout.Group>
					<Select
						label="Type"
						options={[
							{ value: "CALENDAR", label: "Calendar" },
							{ value: "TEXT_INPUT", label: "Text + Calendar" },
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
					label="Field label color"
					fieldId="fieldLabelColor"
					onChange={handleWidgetStyleChange("fieldLabelColor")}
					value={widgetSettings.styles.fieldLabelColor ?? defaultWidgetStyles.fieldLabelColor}
				/>
				<Checkbox
					label="Bold field label"
					checked={getFieldLabelIsBold(widgetSettings)}
					onChange={handleFieldLabelIsBoldChange}
				/>

				<FormLayout.Group>
					<ColorPickerField
						fieldId="errorFontColor"
						label="Error font color"
						onChange={handleWidgetStyleChange("errorFontColor")}
						value={widgetSettings.styles.errorFontColor}
					/>
					<ColorPickerField
						fieldId="errorBorderColor"
						label="Error border color"
						onChange={handleWidgetStyleChange("errorBorderColor")}
						value={widgetSettings.styles.errorBorderColor ?? defaultWidgetStyles.errorBorderColor}
					/>
				</FormLayout.Group>

				<FormLayout.Group>
					<ColorPickerField
						fieldId="fieldHelpTextColor"
						label="Field help text color"
						onChange={handleWidgetStyleChange("fieldHelpTextColor")}
						value={widgetSettings.styles.fieldHelpTextColor ?? defaultWidgetStyles.fieldHelpTextColor}
					/>
				</FormLayout.Group>

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

				{widgetSettings.showOnPage == "PRODUCT" && (
					<Checkbox
						label="Only allow to select one date per order"
						checked={widgetSettings.singleDatePerOrder}
						onChange={(value) => handleSingleDatePerOrderChange(value)}
					/>
				)}

				<Checkbox
					label="Show the day of week in the cart and checkout page (e.g. Delivery Day: Monday)"
					helpText="If turned off only the date will show. (e.g. Delivery Date: August 2, 2021)"
					checked={widgetSettings.showDayOfWeekTag ?? DEFAULT_SHOW_DAY_OF_WEEK_TAG}
					onChange={(value) => handleShowDayOfWeekTagChange(value)}
				/>
			</FormLayout>
		</Card>
	)
}
