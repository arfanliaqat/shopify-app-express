import React, { useContext } from "react"
import { Card } from "@shopify/polaris"
import Preview from "./Preview"
import ColorPickerField from "./ColorPickerField"
import { WidgetStyles } from "../../../widget/src/models/WidgetSettings"
import { SettingsLayoutContext } from "./SettingsLayout"

interface Props {}

export default function PreviewCard({}: Props) {
	const { widgetSettings, setWidgetSettings } = useContext(SettingsLayoutContext)

	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	return (
		<div className="previewCard">
			<Card>
				<Card.Section>
					<div className="Polaris-Heading">Preview</div>
				</Card.Section>
				<Card.Section>
					<Preview />
				</Card.Section>
				<Card.Section>
					<ColorPickerField
						label="Preview background color"
						fieldId="previewBackgroundColor"
						onChange={handleWidgetStyleChange("previewBackgroundColor")}
						value={widgetSettings.styles.previewBackgroundColor}
					/>
				</Card.Section>
			</Card>
		</div>
	)
}
