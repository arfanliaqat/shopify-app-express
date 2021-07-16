import React from "react"
import { Card, Layout, Checkbox, Banner, FormLayout, Select } from "@shopify/polaris"
import { Page, WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { DEFAULT_SHOW_ON_PAGE } from "../../../backend/src/util/constants"

interface Props {
	initialWidgetSettings: WidgetSettings
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function VisibilityToggle({ initialWidgetSettings, widgetSettings, onWidgetSettingsChange }: Props) {
	const handleVisibilityChange = (isVisible: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, isVisible })
	}

	const handleShowOnPage = (showOnPage: Page) => {
		onWidgetSettingsChange({ ...widgetSettings, showOnPage })
	}

	return (
		<Card sectioned>
			<Layout>
				{!initialWidgetSettings.isVisible && (
					<Layout.Section>
						<Banner status="warning" action={{ content: "Guide", url: "/app/guide" }}>
							The date picker is currently hidden from your shop. To make it visible make sure to tick the
							following box and save. <br />
							Read our guide for more information.
						</Banner>
					</Layout.Section>
				)}
				{initialWidgetSettings.isVisible && (
					<Layout.Section>
						<Banner status="info" action={{ content: "Guide", url: "/app/guide" }}>
							Is the date picker still not visible? Please make sure to check our guide.
						</Banner>
					</Layout.Section>
				)}
				<Layout.Section>
					<FormLayout>
						<Checkbox
							checked={widgetSettings.isVisible}
							label="Make the date picker visible on your shop"
							onChange={handleVisibilityChange}
						/>

						{widgetSettings.isVisible && (
							<Select
								label="Date picker location"
								options={[
									{ value: "PRODUCT", label: "Show on the product page" },
									{ value: "CART", label: "Show on the cart page" }
								]}
								value={widgetSettings.showOnPage || DEFAULT_SHOW_ON_PAGE}
								onChange={handleShowOnPage}
							/>
						)}
					</FormLayout>
				</Layout.Section>
			</Layout>
		</Card>
	)
}
