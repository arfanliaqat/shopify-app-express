import React from "react"
import { Banner, Button, Card, Layout, ProgressBar } from "@shopify/polaris"
import ShopPlan from "../models/ShopPlan"
import { plans } from "../../../backend/src/util/constants"

interface Props {
	shopPlan: ShopPlan
	currentOrderCount: number
}

export default function CurrentPlanCard({ currentOrderCount, shopPlan }: Props) {
	const progressPercent = (currentOrderCount * 100) / shopPlan.orderLimit
	const approachingLimit = progressPercent >= 80
	const reachedLimit = currentOrderCount >= shopPlan.orderLimit
	const planOptions = plans[shopPlan.plan]
	return (
		<Card sectioned>
			<Layout>
				<Layout.Section>
					<div className="ordersCount">
						<p>
							Current plan: <strong>{planOptions.title}</strong>
						</p>
						<p>
							Orders made this month: <strong>{currentOrderCount}</strong> out of{" "}
							<strong>{planOptions.orderLimit}</strong>
						</p>
					</div>
					<ProgressBar progress={progressPercent} size="large" />
				</Layout.Section>
				<Layout.Section>
					{!approachingLimit && !reachedLimit && <Button url="/app/plans">Change your plan</Button>}
					{approachingLimit && !reachedLimit && (
						<Banner
							title={"You've almost reached your plan's limit this month"}
							action={{ content: "Change your plan", url: "/app/plans" }}
							status="warning"
						>
							You're currently allowed a maximum of {planOptions.orderLimit} orders per month. Once the
							limit is reached, the calendar will stop showing on your shop. Please consider upgrading
							your plan right now to avoid any interruption.
						</Banner>
					)}
					{reachedLimit && (
						<Banner
							title={"You've reached your plan's limit this month!"}
							action={{ content: "Change your plan", url: "/app/plans" }}
							status="critical"
						>
							You're currently allowed a maximum of {planOptions.orderLimit} orders per month.
							Unfortunately since the limit was reached the calendar has stopped showing on your shop.
							Please consider upgrading your plan to instantly resume our service.
						</Banner>
					)}
				</Layout.Section>
			</Layout>
		</Card>
	)
}
