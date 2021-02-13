import React  from "react"
import { Card, Checkbox, FormLayout, Select } from "@shopify/polaris"
import ColorPickerField from "./ColorPickerField"
import { WidgetSettings, WidgetStyles } from "../../../widget/src/models/WidgetSettings"

const BOX_SHADOW = "0 0 5px rgba(0,0,0,0.15)"
const BOX_BORDER_RADIUS = "10px"
const HEADER_FONT_WEIGHT = "bold"

function getTheme(widgetSettings: WidgetSettings): string {
	if (widgetSettings.styles.calendarBorderRadius == BOX_BORDER_RADIUS) {
		return "ROUNDED"
	}
	return "SQUARED"
}

function getWithShadow(widgetSettings: WidgetSettings): boolean {
	return widgetSettings.styles.calendarBoxShadow == BOX_SHADOW
}

function getBoldHeaderDays(widgetSettings: WidgetSettings): boolean {
	return widgetSettings.styles.headerDaysFontWeight == HEADER_FONT_WEIGHT
}

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function CalendarStylesCard({ widgetSettings, onWidgetSettingsChange }: Props) {
	const handleWithShadowChange = (checked: boolean) => {
		const styles = { ...widgetSettings.styles, calendarBoxShadow: checked ? BOX_SHADOW : "" }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	const handleBoldHeaderDaysChange = (checked: boolean) => {
		const styles = { ...widgetSettings.styles, headerDaysFontWeight: checked ? HEADER_FONT_WEIGHT : "" }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	const handleThemeChange = (theme: string) => {
		const styles = { ...widgetSettings.styles, calendarBorderRadius: theme == "ROUNDED" ? BOX_BORDER_RADIUS : "" }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	return (
		<Card title="Calendar styles">
			<Card.Section>
				<FormLayout>
					<FormLayout.Group>
						<Select
							label="Theme"
							options={[
								{ value: "ROUNDED", label: "Rounded" },
								{ value: "SQUARED", label: "Squared" }
							]}
							value={getTheme(widgetSettings)}
							onChange={handleThemeChange}
						/>

						<ColorPickerField
							label="Calendar background color"
							onChange={handleWidgetStyleChange("calendarBackgroundColor")}
							value={widgetSettings.styles.calendarBackgroundColor}
						/>
					</FormLayout.Group>

					<Checkbox
						label="With shadow around the box"
						checked={getWithShadow(widgetSettings)}
						onChange={handleWithShadowChange}
					/>
				</FormLayout>
			</Card.Section>
			<Card.Section>
				<FormLayout>
					<FormLayout.Group>
						<ColorPickerField
							label="Header font color"
							onChange={handleWidgetStyleChange("headerFontColor")}
							value={widgetSettings.styles.headerFontColor}
						/>

						<ColorPickerField
							label="Days (header) font color"
							onChange={handleWidgetStyleChange("headerDaysFontColor")}
							value={widgetSettings.styles.headerDaysFontColor}
						/>
					</FormLayout.Group>

					<Checkbox
						label="Bold days (header)"
						checked={getBoldHeaderDays(widgetSettings)}
						onChange={handleBoldHeaderDaysChange}
					/>
				</FormLayout>
			</Card.Section>
			<Card.Section>
				<FormLayout>
					<FormLayout.Group>
						<ColorPickerField
							label="Unavailable day font color"
							onChange={handleWidgetStyleChange("dayUnavailableFontColor")}
							value={widgetSettings.styles.dayUnavailableFontColor}
						/>
						<ColorPickerField
							label="Available day font color"
							onChange={handleWidgetStyleChange("dayAvailableFontColor")}
							value={widgetSettings.styles.dayAvailableFontColor}
						/>
					</FormLayout.Group>

					<FormLayout.Group>
						<ColorPickerField
							label="Day selected background color"
							onChange={handleWidgetStyleChange("daySelectedBackgroundColor")}
							value={widgetSettings.styles.daySelectedBackgroundColor}
						/>
						<ColorPickerField
							label="Day selected font color"
							onChange={handleWidgetStyleChange("daySelectedFontColor")}
							value={widgetSettings.styles.daySelectedFontColor}
						/>
					</FormLayout.Group>

					<FormLayout.Group>
						<ColorPickerField
							label="Next/prev. arrows color"
							onChange={handleWidgetStyleChange("arrowIconColor")}
							value={widgetSettings.styles.arrowIconColor}
						/>
					</FormLayout.Group>
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
