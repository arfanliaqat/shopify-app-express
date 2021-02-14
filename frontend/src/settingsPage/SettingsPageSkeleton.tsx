import React from "react"
import { Card, Layout, SkeletonBodyText, SkeletonPage } from "@shopify/polaris"

interface Props {}

export default function SettingsPageSkeleton({}: Props) {
	return (
		<div id="settingsPage">
			<SkeletonPage title="Settings" primaryAction breadcrumbs>
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
