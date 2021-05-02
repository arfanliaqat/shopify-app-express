import React, { useCallback, useEffect, useState } from "react"
import { Page, Layout, TextContainer } from "@shopify/polaris"
import { isStockByDateApp } from "../common/constants"
import { Plan } from "../../../backend/src/shopPlan/shopPlan.model"
import ChoosePlanConfirmationModal from "./ChoosePlanConfirmationModal"
import { useApi } from "../util/useApi"
import ShopPlan from "../models/ShopPlan"
import PlanCard from "./PlanCard"
import { TRIAL_DAYS } from "../../../backend/src/util/constants"
import PlansPageSkeleton from "./PlansPageSkeleton"
import { useAppBridge } from "@shopify/app-bridge-react"

interface Props {}

export default function PlansPage({}: Props) {
	const app = useAppBridge()

	const [selectedPlan, setSelectedPlan] = useState<Plan>()
	const [currentShopPlan, setCurrentShopPlan] = useState<ShopPlan>()
	const [trialAlreadyUsed, setTrialIsAlreadyUsed] = useState<boolean>()

	const { setApiRequest: fetchPeriod, isLoading } = useApi<{ plan: ShopPlan; trialAlreadyUsed: boolean }>(
		{
			onSuccess: useCallback((response) => {
				setTrialIsAlreadyUsed(response.trialAlreadyUsed)
				setCurrentShopPlan(response.plan)
			}, [])
		},
		app
	)

	useEffect(() => {
		fetchPeriod({
			url: `/plans_page`
		})
	}, [])

	if (isLoading) {
		return <PlansPageSkeleton />
	}

	return (
		<div id="plansPage">
			{selectedPlan && (
				<ChoosePlanConfirmationModal
					plan={selectedPlan}
					onClose={() => setSelectedPlan(undefined)}
					trialAlreadyUsed={trialAlreadyUsed}
				/>
			)}
			<Page
				breadcrumbs={
					currentShopPlan && [{ content: "Settings", url: isStockByDateApp ? "/app/settings" : "/app" }]
				}
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
							{trialAlreadyUsed === false && (
								<p>
									All our plans come with a <strong>{TRIAL_DAYS}-day trial</strong> period.
								</p>
							)}
						</TextContainer>
					</Layout.Section>
					<Layout.Section oneThird>
						<PlanCard
							plan="BASIC"
							currentShopPlan={currentShopPlan}
							onSelectClick={(plan: Plan) => setSelectedPlan(plan)}
						/>
					</Layout.Section>
					<Layout.Section oneThird>
						<PlanCard
							plan="PRO"
							currentShopPlan={currentShopPlan}
							onSelectClick={(plan: Plan) => setSelectedPlan(plan)}
						/>
					</Layout.Section>
					<Layout.Section oneThird>
						<PlanCard
							plan="UNLIMITED"
							currentShopPlan={currentShopPlan}
							onSelectClick={(plan: Plan) => setSelectedPlan(plan)}
						/>
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
