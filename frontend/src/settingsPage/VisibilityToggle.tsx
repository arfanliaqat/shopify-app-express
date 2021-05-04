import React from "react"
import { Card, Layout, Checkbox, Banner, Link } from "@shopify/polaris"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"

interface Props {
	initialWidgetSettings: WidgetSettings
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function VisibilityToggle({ initialWidgetSettings, widgetSettings, onWidgetSettingsChange }: Props) {
	const handleVisibilityChange = (isVisible: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, isVisible })
	}

	return (
		<Card sectioned>
			<Layout>
				{!initialWidgetSettings.isVisible && (
					<Layout.Section>
						<Banner status="warning">
							The date picker is currently hidden from your shop. To make it visible make sure to tick the
							following box and save
						</Banner>
					</Layout.Section>
				)}
				{initialWidgetSettings.isVisible && (
					<Layout.Section>
						<Banner status="info">
							Is the date picker still not visible? Please make sure to check{" "}
							<Link url="/app/guide">our guide</Link>.
						</Banner>
					</Layout.Section>
				)}
				<Layout.Section>
					<Checkbox
						checked={widgetSettings.isVisible}
						label="Make the date picker visible on your shop"
						onChange={handleVisibilityChange}
					/>
				</Layout.Section>
			</Layout>
		</Card>
	)
}
