import React from "react"
import { Link, Page, Layout, Heading, TextContainer, TextStyle } from "@shopify/polaris"
import { anchorId, isStockByDateApp } from "../common/constants"

interface Props {}

export default function GuidePage({}: Props) {
	return (
		<div id="guidePage">
			<Page
				title="Guide"
				breadcrumbs={[{ content: "Settings", url: isStockByDateApp ? "/app/settings" : "/app" }]}
			>
				<Layout>
					<Layout.Section fullWidth>
						<TextContainer>
							<Heading>App settings</Heading>
							<p>
								<TextStyle variation="strong">1. Visibility</TextStyle>
							</p>
							<p>
								Enable or disable Shop By Date. This is disabled by default. When enabled the date
								picker will appear in your shop on product pages and featured product sections of the
								homepage.
							</p>
							<p>
								<TextStyle variation="strong">2. Plan</TextStyle>
							</p>
							<p>
								Upgrade your plan here at any moment. The calendar will stop showing on your shop once
								the limit is reached so you might want to upgrade before that happens.
							</p>
							<p>
								<img
									src="/public/images/guide_visibility_and_plan.png"
									alt="Calendar visibility / Plan"
									style={{ maxWidth: "923px", width: "100%" }}
								/>
							</p>
						</TextContainer>
						<div className="pageSeparator" />
						<TextContainer>
							<Heading>Availability settings</Heading>
							<p>
								<TextStyle variation="strong">3. First available date</TextStyle>
							</p>
							<p>
								Delay product availability when a product is ordered. For example to allow for
								production or shipping.
							</p>
							<p>
								<TextStyle variation="strong">4. Cut off time</TextStyle>
							</p>
							<p>
								Last orders on any given day. After this time, days set in (3) will count from tomorrow.
							</p>
							<p>
								<TextStyle variation="strong">5. Last available date</TextStyle>
							</p>
							<p>Limits how far in advance customers will be able to select dates.</p>
							<p>
								<TextStyle variation="strong">6. Available days</TextStyle>
							</p>
							<p>Select at which days of the week products in your shop will be available.</p>
							<p>
								<TextStyle variation="strong">7. Disabled dates</TextStyle>
							</p>
							<p>Dates added here will be made unavailable in the calendar</p>
							<p>
								<img
									src="/public/images/guide_availability_settings.png"
									alt="Availability settings"
									style={{ maxWidth: "920px", width: "100%" }}
								/>
							</p>
						</TextContainer>
						<div className="pageSeparator" />
						<TextContainer>
							<Heading>Design settings</Heading>
							<p>
								<TextStyle variation="strong">8. Date picker settings</TextStyle>
							</p>
							<p>Select your preferred date picker style: Dropdown or calendar</p>
							<p>
								<TextStyle variation="strong">9. Language and date format</TextStyle>
							</p>
							<p>Set start of the week and calendar language</p>
							<p>
								<TextStyle variation="strong">10. Error font color</TextStyle>
							</p>
							<p>Color for error messages</p>
							<p>
								<img
									src="/public/images/guide_date_picker_settings.png"
									alt="Date picker settings"
									style={{ maxWidth: "607px", width: "100%" }}
								/>
							</p>
							<p>
								<TextStyle variation="strong">11. Calendar styles</TextStyle>
							</p>
							<p>Adjust CSS settings to match your store design.</p>
							<p>
								<TextStyle variation="strong">12. Preview</TextStyle>
							</p>
							<p>See your CSS changes in real time.</p>
							<p>
								<img
									src="/public/images/guide_calendar_styles.png"
									alt="Calendar style settings"
									style={{ maxWidth: "908px", width: "100%" }}
								/>
							</p>
							<p>
								<TextStyle variation="strong">13. Dropdown styles</TextStyle>
							</p>
							<p>Adjust CSS settings to match your store design.</p>
							<p>
								<TextStyle variation="strong">14. Preview</TextStyle>
							</p>
							<p>See your CSS changes in real time.</p>
							<p>
								<img
									src="/public/images/guide_dropdown_styles.png"
									alt="Dropdown style settings"
									style={{ maxWidth: "908px", width: "100%" }}
								/>
							</p>
						</TextContainer>
						<div className="pageSeparator" />
						<TextContainer>
							<Heading>Manually placing the date picker</Heading>
							<p>
								To manually adjust the position of the date picker a{" "}
								<TextStyle variation="code">{"<div>"}</TextStyle> can tag can be placed in the source
								code of your template.
							</p>
							<p>
								To do this Select Online Store &gt; Themes in the side bar. Then select “Edit code” in
								the “Actions” dropdown.
							</p>
							<p>
								<img
									src="/public/images/guide_edit_code.png"
									alt="Edit your theme's code"
									style={{ maxWidth: "906px", width: "100%" }}
								/>
							</p>
							<p>
								In "Sections" find "product-template.liquid". Within the{" "}
								<TextStyle variation="code">{"<form></form>"}</TextStyle> tags, add the following to
								place the picker.
							</p>
							<p>
								<TextStyle variation="code">{`<div id="${anchorId}"></div>`}</TextStyle>
							</p>
							<p>
								<img
									src="/public/images/guide_place_div.png"
									alt="Place the date picker"
									style={{ maxWidth: "902px", width: "100%" }}
								/>
							</p>
						</TextContainer>
						<div className="pageSeparator" />
						<TextContainer>
							<Heading>Still having some troubles installing Shop By Date?</Heading>
							<p>
								Don't hesitate to contact our support team! You can contact us via email at{" "}
								<Link url="mailto:support@h10.studio">support@h10.studio</Link>.
							</p>
						</TextContainer>
					</Layout.Section>
				</Layout>
			</Page>
		</div>
	)
}
