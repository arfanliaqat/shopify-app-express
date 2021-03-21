import React from "react"
import { Card, Layout, SkeletonBodyText, SkeletonPage } from "@shopify/polaris"

interface Props {}

export default function PlansPageSkeleton({}: Props) {
	return (
		<div id="plansPageSkeleton">
			<SkeletonPage title="Choose your plan" breadcrumbs>
				<Layout>
					<Layout.Section fullWidth>
						<SkeletonBodyText lines={2} />
					</Layout.Section>
					<Layout.Section oneThird>
						<Card sectioned>
							<SkeletonBodyText lines={8} />
						</Card>
					</Layout.Section>
					<Layout.Section oneThird>
						<Card sectioned>
							<SkeletonBodyText lines={8} />
						</Card>
					</Layout.Section>
					<Layout.Section oneThird>
						<Card sectioned>
							<SkeletonBodyText lines={8} />
						</Card>
					</Layout.Section>
					<Layout.Section fullWidth>
						<SkeletonBodyText lines={2} />
					</Layout.Section>
				</Layout>
			</SkeletonPage>
		</div>
	)
}
