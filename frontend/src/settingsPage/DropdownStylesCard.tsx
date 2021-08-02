import React from "react"
import { WidgetSettings, WidgetStyles } from "../../../widget/src/models/WidgetSettings"
import { Card, TextField, FormLayout } from "@shopify/polaris"
import ColorPickerField from "./ColorPickerField"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function DropdownStylesCard({ widgetSettings, onWidgetSettingsChange }: Props) {
	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	const handleBorderWidthChange = (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, dropdownBorderWidth: value + "px" }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	const parsePixelSize = (strValue: string): number => {
		const matches = /(\d+)px/.exec(strValue)
		return (matches || []).length > 1 ? parseInt(matches[1]) : 0
	}

	return (
		<Card title={widgetSettings.pickerType == "TEXT_INPUT" ? "Text input styles" : "Dropdown styles"}>
			<Card.Section>
				<FormLayout>
					<FormLayout.Group>
						<ColorPickerField
							label="Dropdown border color"
							onChange={handleWidgetStyleChange("dropdownBorderColor")}
							value={widgetSettings.styles.dropdownBorderColor}
						/>
						<ColorPickerField
							label="Dropdown background color"
							onChange={handleWidgetStyleChange("dropdownBackgroundColor")}
							value={widgetSettings.styles.dropdownBackgroundColor}
						/>
					</FormLayout.Group>

					<FormLayout.Group>
						<ColorPickerField
							label="Dropdown text color"
							onChange={handleWidgetStyleChange("dropdownTextColor")}
							value={widgetSettings.styles.dropdownTextColor}
						/>
						<TextField
							label="Dropdown border width"
							type="number"
							onChange={handleBorderWidthChange}
							suffix="px"
							min={0}
							max={5}
							value={parsePixelSize(widgetSettings.styles.dropdownBorderWidth) + ""}
						/>
					</FormLayout.Group>
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
