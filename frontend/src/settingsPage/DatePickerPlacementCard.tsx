import React, { useContext } from "react"
import {
	Card,
	Checkbox,
	Banner,
	RadioButton,
	Stack,
	FormLayout,
	TextField,
	Select,
	Heading,
	Link
} from "@shopify/polaris"
import {
	AnchorPosition,
	FilterType,
	Page,
	PlacementMethod,
	Collection
} from "../../../widget/src/models/WidgetSettings"
import {
	DEFAULT_ANCHOR_POSITION,
	DEFAULT_FILTER_TYPE,
	DEFAULT_PLACEMENT_METHOD,
	DEFAULT_SHOW_ON_PAGE
} from "../../../backend/src/util/constants"
import CollectionPicker from "./CollectionPicker"
import ProductTagPicker from "./ProductTagPicker"
import { SettingsLayoutContext } from "./SettingsLayout"

interface Props {}

export default function DatePickerPlacementCard({}: Props) {
	const { initialWidgetSettings, widgetSettings, setWidgetSettings } = useContext(SettingsLayoutContext)
	if (!widgetSettings) return null

	const handleVisibilityChange = (isVisible: boolean) => {
		setWidgetSettings({ ...widgetSettings, isVisible })
	}

	const handleShowOnPage = (checked: boolean, showOnPage: Page) => {
		setWidgetSettings({ ...widgetSettings, showOnPage })
	}

	const handlePlacementMethod = (checked: boolean, placementMethod: PlacementMethod) => {
		setWidgetSettings({ ...widgetSettings, placementMethod })
	}

	const handleAnchorSelector = (anchorSelector: string) => {
		setWidgetSettings({ ...widgetSettings, anchorSelector })
	}

	const handleAnchorPosition = (anchorPosition: AnchorPosition) => {
		setWidgetSettings({ ...widgetSettings, anchorPosition })
	}

	const handleFilterType = (checked: boolean, filterType: FilterType) => {
		setWidgetSettings({ ...widgetSettings, filterType })
	}

	const handleCollectionsChange = (filterCollections: Collection[]) => {
		setWidgetSettings({ ...widgetSettings, filterCollections })
	}

	const handleProductTagsChange = (filterProductTags: string[]) => {
		setWidgetSettings({ ...widgetSettings, filterProductTags })
	}

	const showOnPage = widgetSettings.showOnPage || DEFAULT_SHOW_ON_PAGE
	const placementMethod: string = widgetSettings.placementMethod || DEFAULT_PLACEMENT_METHOD
	const anchorPosition: AnchorPosition = widgetSettings.anchorPosition || DEFAULT_ANCHOR_POSITION
	const filterType: FilterType = widgetSettings.filterType || DEFAULT_FILTER_TYPE

	return (
		<>
			{!initialWidgetSettings.isVisible && (
				<>
					<Banner status="warning">
						The date picker is currently hidden from your shop. To make it visible make sure to tick the
						"Make the date picker visible on your store" box and save. <br />
					</Banner>
					<div style={{ height: "30px" }} />
				</>
			)}
			<Card>
				<div className="cardWithHelpHeader">
					<h2 className="cardTitle">
						<Heading element="h2">Date picker placement</Heading>
					</h2>
					<div className="helpLink">
						<Link
							external
							url="https://buunto.helpscoutdocs.com/article/8-how-to-place-the-date-picker-on-your-shop"
						>
							How to place the date picker on your shop
						</Link>
					</div>
				</div>
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
								<RadioButton
									label="Only show the date picker for specific product tags"
									id="PRODUCT_TAGS"
									checked={filterType == "PRODUCT_TAGS"}
									onChange={handleFilterType}
								/>
								{filterType == "PRODUCT_TAGS" && (
									<ProductTagPicker
										productTags={widgetSettings.filterProductTags || []}
										onChange={handleProductTagsChange}
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
