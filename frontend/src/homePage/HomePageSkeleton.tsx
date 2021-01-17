import React from "react"
import { Card, SkeletonBodyText, SkeletonPage } from "@shopify/polaris"

export default function HomePageSkeleton() {
	return (
		<div id="homePage">
			<SkeletonPage title="Products" primaryAction>
				<Card>
					{Array.from({ length: 5 }).map((val, index) => (
						<Card.Section key={index}>
							<SkeletonBodyText lines={3} />
						</Card.Section>
					))}
				</Card>
			</SkeletonPage>
		</div>
	)
}
