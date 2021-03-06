import React, { useContext } from "react"
import { Card, Checkbox, FormLayout, Select } from "@shopify/polaris"
import ColorPickerField from "./ColorPickerField"
import { WidgetSettings, WidgetStyles } from "../../../widget/src/models/WidgetSettings"
import { SettingsLayoutContext } from "./SettingsLayout"

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

interface Props {}

export default function CalendarStylesCard({}: Props) {
	const { widgetSettings, setWidgetSettings } = useContext(SettingsLayoutContext)
	if (!widgetSettings) return null

	const handleWithShadowChange = (checked: boolean) => {
		const styles = { ...widgetSettings.styles, calendarBoxShadow: checked ? BOX_SHADOW : "" }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	const handleBoldHeaderDaysChange = (checked: boolean) => {
		const styles = { ...widgetSettings.styles, headerDaysFontWeight: checked ? HEADER_FONT_WEIGHT : "" }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	const handleThemeChange = (theme: string) => {
		const styles = { ...widgetSettings.styles, calendarBorderRadius: theme == "ROUNDED" ? BOX_BORDER_RADIUS : "" }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		setWidgetSettings({ ...widgetSettings, styles })
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
							fieldId="calendarBackgroundColor"
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
							fieldId="headerFontColor"
							onChange={handleWidgetStyleChange("headerFontColor")}
							value={widgetSettings.styles.headerFontColor}
						/>

						<ColorPickerField
							label="Days (header) font color"
							fieldId="headerDaysFontColor"
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
							fieldId="dayUnavailableFontColor"
							onChange={handleWidgetStyleChange("dayUnavailableFontColor")}
							value={widgetSettings.styles.dayUnavailableFontColor}
						/>
						<ColorPickerField
							label="Available day font color"
							fieldId="dayAvailableFontColor"
							onChange={handleWidgetStyleChange("dayAvailableFontColor")}
							value={widgetSettings.styles.dayAvailableFontColor}
						/>
					</FormLayout.Group>

					<FormLayout.Group>
						<ColorPickerField
							label="Day selected background color"
							fieldId="daySelectedBackgroundColor"
							onChange={handleWidgetStyleChange("daySelectedBackgroundColor")}
							value={widgetSettings.styles.daySelectedBackgroundColor}
						/>
						<ColorPickerField
							label="Day selected font color"
							fieldId="daySelectedFontColor"
							onChange={handleWidgetStyleChange("daySelectedFontColor")}
							value={widgetSettings.styles.daySelectedFontColor}
						/>
					</FormLayout.Group>

					<FormLayout.Group>
						<ColorPickerField
							label="Next/prev. arrows color"
							fieldId="arrowIconColor"
							onChange={handleWidgetStyleChange("arrowIconColor")}
							value={widgetSettings.styles.arrowIconColor}
						/>
					</FormLayout.Group>
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
