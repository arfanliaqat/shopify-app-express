import React from "react"
import { Card, Layout, SkeletonBodyText, SkeletonPage } from "@shopify/polaris"
import { isStockByDateApp } from "../common/constants"

interface Props {}

export default function SettingsPageSkeleton({}: Props) {
	return (
		<div id="settingsPage">
			<SkeletonPage
				title={isStockByDateApp && "Settings"}
				primaryAction={isStockByDateApp}
				breadcrumbs={isStockByDateApp}
			>
				<Card>
					<Card.Section>
						<SkeletonBodyText lines={5} />
					</Card.Section>
				</Card>
				<div className="pageSeparator" />
				<Layout>
					<Layout.Section>
						<Card>
							<Card.Section>
								<SkeletonBodyText lines={5} />
							</Card.Section>
						</Card>
						<Card>
							<Card.Section>
								<SkeletonBodyText lines={5} />
							</Card.Section>
						</Card>
					</Layout.Section>
					<Layout.Section oneThird>
						<Card>
							<Card.Section>
								<SkeletonBodyText lines={5} />
							</Card.Section>
						</Card>
					</Layout.Section>
				</Layout>
				<div className="pageSeparator" />
				<Card>
					<Card.Section>
						<SkeletonBodyText lines={5} />
					</Card.Section>
				</Card>
			</SkeletonPage>
		</div>
	)
}
