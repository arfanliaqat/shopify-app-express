import React from "react"
import { Card, Page, SkeletonDisplayText } from "@shopify/polaris"

interface Props {}

export default function CalendarPageSkeleton({}: Props) {
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
				<Card>
					<div className="skeletonCalendar">
						{Array.from({ length: 5 }).map((val, weekIndex) => (
							<div key={weekIndex} className="skeletonWeek">
								{Array.from({ length: 7 }).map((val, dayIndex) => (
									<div key={dayIndex} className="skeletonDay" />
								))}
							</div>
						))}
					</div>
				</Card>
			</Page>
		</div>
	)
}
