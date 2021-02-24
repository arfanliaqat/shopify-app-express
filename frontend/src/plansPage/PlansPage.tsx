import React from "react"
import { Page, Layout, Card, Button, TextContainer } from "@shopify/polaris"
import { isStockByDateApp } from "../common/constants"

interface Props {}

export default function PlansPage({}: Props) {
	return (
		<div id="plansPage">
			<Page
				breadcrumbs={[{ content: "Settings", url: isStockByDateApp ? "/app/settings" : "/app" }]}
				title="Choose your plan"
				separator
			>
				<Layout>
					<Layout.Section fullWidth>
						<TextContainer>
							<p>
								Before we get you set up, please choose your plan. Next you’ll be able to customise and
								install your date picker.
							</p>
							<p>
								All our plans come with a <strong>14-day trial</strong> period.
							</p>
						</TextContainer>
					</Layout.Section>
					<Layout.Section oneThird>
						<Card sectioned>
							<div className="plan">
								<div className="name">Basic</div>
								<div className="price">
									<strong>$5</strong> per month
								</div>
								<ul>
									<li>Customizable date picker</li>
									<li>Unlimited products</li>
									<li>Unlimited traffic</li>
									<li>
										Up to <strong>100</strong> orders per month
									</li>
									<li>48h support response time</li>
								</ul>
								<Button fullWidth primary>
									Select
								</Button>
							</div>
						</Card>
					</Layout.Section>
					<Layout.Section oneThird>
						<Card sectioned>
							<div className="plan">
								<div className="name">Pro</div>
								<div className="price">
									<strong>$10</strong> per month
								</div>
								<ul>
									<li>Customizable date picker</li>
									<li>Unlimited products</li>
									<li>Unlimited traffic</li>
									<li>
										Up to <strong>500</strong> orders per month
									</li>
									<li>24h support response time</li>
								</ul>
								<Button fullWidth primary>
									Select
								</Button>
							</div>
						</Card>
					</Layout.Section>
					<Layout.Section oneThird>
						<Card sectioned>
							<div className="plan">
								<div className="name">Unlimited</div>
								<div className="price">
									<strong>$15</strong> per month
								</div>
								<ul>
									<li>Customizable date picker</li>
									<li>Unlimited products</li>
									<li>Unlimited traffic</li>
									<li>
										<strong>Unlimited</strong> orders
									</li>
									<li>12h support response time</li>
								</ul>
								<Button fullWidth primary>
									Select
								</Button>
							</div>
						</Card>
					</Layout.Section>
					<Layout.Section fullWidth>
						<TextContainer>
							<p>You’ll be able to change you plan or cancel at any point.</p>
							<p>
								If you have any question please send us an email at{" "}
								<a href="mailto:hi@h10.studio">hi@h10.studio</a>.
							</p>
						</TextContainer>
					</Layout.Section>
				</Layout>
			</Page>
		</div>
	)
}
