import React from "react"
import { Card, Checkbox, Banner, RadioButton, Stack, FormLayout, TextField, Select } from "@shopify/polaris"
import { AnchorPosition, Page, PlacementMethod, WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import {
	DEFAULT_ANCHOR_POSITION,
	DEFAULT_PLACEMENT_METHOD,
	DEFAULT_SHOW_ON_PAGE
} from "../../../backend/src/util/constants"

interface Props {
	initialWidgetSettings: WidgetSettings
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function VisibilityToggle({ initialWidgetSettings, widgetSettings, onWidgetSettingsChange }: Props) {
	const handleVisibilityChange = (isVisible: boolean) => {
		onWidgetSettingsChange({ ...widgetSettings, isVisible })
	}

	const handleShowOnPage = (checked: boolean, showOnPage: Page) => {
		onWidgetSettingsChange({ ...widgetSettings, showOnPage })
	}

	const handlePlacementMethod = (checked: boolean, placementMethod: PlacementMethod) => {
		onWidgetSettingsChange({ ...widgetSettings, placementMethod })
	}

	const handleAnchorSelector = (anchorSelector: string) => {
		console.log("anchorSelector", anchorSelector)
		onWidgetSettingsChange({ ...widgetSettings, anchorSelector })
	}

	const handleAnchorPosition = (anchorPosition: AnchorPosition) => {
		onWidgetSettingsChange({ ...widgetSettings, anchorPosition })
	}

	const showOnPage = widgetSettings.showOnPage || DEFAULT_SHOW_ON_PAGE
	const placementMethod: string = widgetSettings.placementMethod || DEFAULT_PLACEMENT_METHOD
	const anchorPosition: AnchorPosition = widgetSettings.anchorPosition || DEFAULT_ANCHOR_POSITION

	return (
		<Card title="Date picker placement">
			{!initialWidgetSettings.isVisible && (
				<Card.Section>
					<Banner status="warning" action={{ content: "Guide", url: "/app/guide" }}>
						The date picker is currently hidden from your shop. To make it visible make sure to tick the
						following box and save. <br />
						Read our guide for more information.
					</Banner>
				</Card.Section>
			)}
			{initialWidgetSettings.isVisible && (
				<Card.Section>
					<Banner status="info" action={{ content: "Guide", url: "/app/guide" }}>
						Is the date picker still not visible? Please make sure to check our guide.
					</Banner>
				</Card.Section>
			)}
			<Card.Section>
				<Checkbox
					checked={widgetSettings.isVisible}
					label="Make the date picker visible on your shop"
					onChange={handleVisibilityChange}
				/>
			</Card.Section>
			{widgetSettings.isVisible && (
				<Card.Section>
					<Stack>
						<RadioButton
							label="Show on the Product page"
							helpText="Ask your customers to select a date just before adding a product to the cart."
							id="PRODUCT"
							checked={showOnPage == "PRODUCT"}
							onChange={handleShowOnPage}
						/>
						<RadioButton
							label="Show on the Cart page"
							helpText="Ask your customers to select a date just before starting the checkout process"
							id="CART"
							checked={showOnPage == "CART"}
							onChange={handleShowOnPage}
						/>
					</Stack>
				</Card.Section>
			)}
			{widgetSettings.isVisible && (
				<Card.Section>
					<Stack>
						<RadioButton
							label="Place the widget automatically"
							helpText="The app will try to place the date picker automatically. This should work on most themes. If it doesn't please try to place the widget manually."
							id="AUTOMATIC"
							checked={placementMethod == "AUTOMATIC"}
							onChange={handlePlacementMethod}
						/>
						<RadioButton
							label="Place the widget manually (advanced)"
							helpText="This allows to make the date picker appear anywhere on the cart or product page."
							id="MANUAL"
							checked={placementMethod == "MANUAL"}
							onChange={handlePlacementMethod}
						/>
					</Stack>
				</Card.Section>
			)}
			{widgetSettings.placementMethod == "MANUAL" && (
				<Card.Section>
					<FormLayout>
						<FormLayout.Group condensed>
							<TextField
								label="CSS selector"
								helpText="Select the element you wish to anchor the widget onto (for example: .cart_footer > div:first-child)"
								value={widgetSettings.anchorSelector || ""}
								onChange={handleAnchorSelector}
							/>
							<Select
								label="Widget position"
								options={[
									{
										label: "Before the element",
										value: "BEFORE"
									},
									{
										label: "Inside the element, as first element",
										value: "FIRST_ELEMENT"
									},
									{
										label: "Inside the element, as last element",
										value: "LAST_ELEMENT"
									},
									{
										label: "After the element",
										value: "AFTER"
									}
								]}
								onChange={handleAnchorPosition}
								value={anchorPosition}
							/>
						</FormLayout.Group>
					</FormLayout>
				</Card.Section>
			)}
		</Card>
	)
}
