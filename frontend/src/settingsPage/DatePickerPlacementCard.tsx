import React from "react"
import { Card, Checkbox, Banner, RadioButton, Stack, FormLayout, TextField, Select } from "@shopify/polaris"
import {
	AnchorPosition,
	FilterType,
	Page,
	PlacementMethod,
	WidgetSettings,
	Collection
} from "../../../widget/src/models/WidgetSettings"
import {
	DEFAULT_ANCHOR_POSITION,
	DEFAULT_FILTER_TYPE,
	DEFAULT_PLACEMENT_METHOD,
	DEFAULT_SHOW_ON_PAGE
} from "../../../backend/src/util/constants"
import CollectionPicker from "./CollectionPicker"

interface Props {
	initialWidgetSettings: WidgetSettings
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
}

export default function DatePickerPlacementCard({
	initialWidgetSettings,
	widgetSettings,
	onWidgetSettingsChange
}: Props) {
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
		onWidgetSettingsChange({ ...widgetSettings, anchorSelector })
	}

	const handleAnchorPosition = (anchorPosition: AnchorPosition) => {
		onWidgetSettingsChange({ ...widgetSettings, anchorPosition })
	}

	const handleFilterType = (checked: boolean, filterType: FilterType) => {
		onWidgetSettingsChange({ ...widgetSettings, filterType })
	}

	const handleCollectionsChange = (filterCollections: Collection[]) => {
		onWidgetSettingsChange({ ...widgetSettings, filterCollections })
	}

	const showOnPage = widgetSettings.showOnPage || DEFAULT_SHOW_ON_PAGE
	const placementMethod: string = widgetSettings.placementMethod || DEFAULT_PLACEMENT_METHOD
	const anchorPosition: AnchorPosition = widgetSettings.anchorPosition || DEFAULT_ANCHOR_POSITION
	const filterType: FilterType = widgetSettings.filterType || DEFAULT_FILTER_TYPE

	return (
		<>
			{!initialWidgetSettings.isVisible && (
				<Banner status="warning" action={{ content: "Guide", url: "/app/guide" }}>
					The date picker is currently hidden from your shop. To make it visible make sure to tick the
					following box and save. <br />
					Read our guide for more information.
				</Banner>
			)}
			{initialWidgetSettings.isVisible && (
				<Banner status="info" action={{ content: "Guide", url: "/app/guide" }}>
					Is the date picker still not visible? Please make sure to check our guide.
				</Banner>
			)}
			<div style={{ height: "30px" }} />
			<Card title="Date picker placement">
				<Card.Section>
					<Checkbox
						checked={widgetSettings.isVisible}
						label="Make the date picker visible on your store"
						onChange={handleVisibilityChange}
					/>
				</Card.Section>
				{widgetSettings.isVisible && (
					<Card.Section title="Which page should it appear on?">
						<FormLayout>
							<Stack>
								<RadioButton
									label="On the Product page"
									helpText="Ask your customers to select a date just before adding a product to the cart."
									id="PRODUCT"
									checked={showOnPage == "PRODUCT"}
									onChange={handleShowOnPage}
								/>
								<RadioButton
									label="On the Cart page"
									helpText="Ask your customers to select a date just before starting the checkout process."
									id="CART"
									checked={showOnPage == "CART"}
									onChange={handleShowOnPage}
								/>
							</Stack>
						</FormLayout>
					</Card.Section>
				)}
				{widgetSettings.isVisible && (
					<Card.Section title="Where on the page should it be placed?">
						<FormLayout>
							<Stack>
								<RadioButton
									label="Place automatically"
									helpText="The app will try to place the date picker automatically. This should work on most themes. If it doesn't please try to place the date picker manually."
									id="AUTOMATIC"
									checked={placementMethod == "AUTOMATIC"}
									onChange={handlePlacementMethod}
								/>
								<RadioButton
									label="Place manually (advanced)"
									helpText="This allows to make the date picker appear anywhere on the cart or product page."
									id="MANUAL"
									checked={placementMethod == "MANUAL"}
									onChange={handlePlacementMethod}
								/>
							</Stack>
						</FormLayout>
						{widgetSettings.placementMethod == "MANUAL" && (
							<FormLayout.Group condensed>
								<TextField
									label="CSS selector"
									helpText="Select the element you wish to anchor the date picker onto (for example: .cart_footer > div:first-child)."
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
						)}
					</Card.Section>
				)}
				{widgetSettings.isVisible && (
					<Card.Section title="Which products should it appear for?">
						<FormLayout>
							<Stack vertical>
								<RadioButton
									label="Show the date picker for all products"
									id="ALL"
									checked={filterType == "ALL"}
									onChange={handleFilterType}
								/>
								<RadioButton
									label="Only show the date picker for specific collections"
									id="COLLECTIONS"
									checked={filterType == "COLLECTIONS"}
									onChange={handleFilterType}
								/>
								{filterType == "COLLECTIONS" && (
									<CollectionPicker
										collections={widgetSettings.filterCollections || []}
										onChange={handleCollectionsChange}
									/>
								)}
							</Stack>
						</FormLayout>
					</Card.Section>
				)}
			</Card>
		</>
	)
}
