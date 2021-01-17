import React from "react"
import { Card, Layout, Page, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris"
import { SectionMessages } from "./AvailabilityPeriodPage"

interface Props {
	sectionMessages: SectionMessages
}

export default function AvailabilityPeriodPageSkeleton({ sectionMessages }: Props) {
	return (
		<div className="skeletonPage">
			<Page>
				<div className="skeletonBreadcrumb">
					<SkeletonDisplayText size="small" />
				</div>
				<div className="skeletonPageHeader">
					<div className="skeletonThumbnail" />
					<div className="skeletonTitle">
						<SkeletonDisplayText size="large" />
					</div>
				</div>
				<Layout>
					<Layout.AnnotatedSection
						title={sectionMessages.availabilityDates.title}
						description={sectionMessages.availabilityDates.description}
					>
						<Card>
							{Array.from({ length: 5 }).map((val, index) => (
								<Card.Section key={index}>
									<SkeletonBodyText lines={2} />
								</Card.Section>
							))}
						</Card>
					</Layout.AnnotatedSection>

					<Layout.AnnotatedSection
						title={sectionMessages.sharedPeriodQuantity.title}
						description={sectionMessages.sharedPeriodQuantity.description}
					>
						<SkeletonBodyText lines={5} />
					</Layout.AnnotatedSection>

					<Layout.AnnotatedSection
						title={sectionMessages.orders.title}
						description={sectionMessages.orders.description}
					>
						<SkeletonBodyText lines={3} />
					</Layout.AnnotatedSection>
				</Layout>
			</Page>
		</div>
	)
}
