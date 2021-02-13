import React from "react"
import { Card } from "@shopify/polaris"
import Preview from "./Preview"
import ColorPickerField from "./ColorPickerField"
import { WidgetSettings, WidgetStyles } from "../../../widget/src/models/WidgetSettings"

interface Props {
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function PreviewCard({ widgetSettings, onWidgetSettingsChange }: Props) {
	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		onWidgetSettingsChange({ ...widgetSettings, styles })
	}

	return (
		<div className="previewCard">
			<Card>
				<Card.Section>
					<div className="Polaris-Heading">Preview</div>
				</Card.Section>
				<Card.Section>
					<Preview widgetSettings={widgetSettings} />
				</Card.Section>
				<Card.Section>
					<ColorPickerField
						label="Preview background color"
						onChange={handleWidgetStyleChange("previewBackgroundColor")}
						value={widgetSettings.styles.previewBackgroundColor}
					/>
				</Card.Section>
			</Card>
		</div>
	)
}
