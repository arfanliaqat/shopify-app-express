import React, { useState } from "react"
import { useApi } from "../util/useApi"
import ModalBackground from "../util/ModalBackground"
import { Modal, TextContainer } from "@shopify/polaris"
import { Plan, planNames } from "../../../backend/src/shopPlan/shopPlan.model"
import { plans, TRIAL_DAYS } from "../../../backend/src/util/constants"
import { useAppBridge } from "@shopify/app-bridge-react"
import { Redirect } from "@shopify/app-bridge/actions"
import { useHistory } from "react-router-dom"
import { shopifyConfig } from "../models/ShopifyConfig"

interface Props {
	plan: Plan
	onClose: () => void
	trialAlreadyUsed: boolean
}

export default function ChoosePlanConfirmationModal({ plan, onClose, trialAlreadyUsed }: Props) {
	const app = useAppBridge()
	const history = useHistory()

	const [active, setActive] = useState(true)
	const [isLoading, setIsLoading] = useState(false)

	const { setApiRequest: resetSettings } = useApi<{ url: string }>(
		{
			onSuccess: (data) => {
				if (data.url) {
					const redirect = Redirect.create(app)
					redirect.dispatch(Redirect.Action.REMOTE, data.url)
				} else {
					history.push("/app?shopOrigin=" + shopifyConfig.shopOrigin)
				}
			}
		},
		app
	)

	const handleChosePlanClick = () => {
		setIsLoading(true)
		resetSettings({
			method: "post",
			url: "/choose_plan",
			postData: {
				plan
			}
		})
	}
	const handleCloseClick = () => {
		setActive(false)
		onClose()
	}

	const isFreePlan = plans[plan].price == 0

	return (
		<ModalBackground onClose={handleCloseClick}>
			<Modal
				open={active}
				onClose={handleCloseClick}
				title={`Choose the ${planNames[plan]}`}
				primaryAction={{
					content: "Choose plan",
					loading: isLoading,
					onAction: handleChosePlanClick
				}}
			>
				<Modal.Section>
					<TextContainer>
						<p>You are about to select the {planNames[plan]}.</p>
						{isFreePlan && (
							<p>
								This plan is free forever but you will be limited to {plans[plan].orderLimit} orders per
								months.
							</p>
						)}
						{!trialAlreadyUsed && !isFreePlan && (
							<p>
								After the {TRIAL_DAYS}-day trial period you'll be charge ${plans[plan].price} each
								month. This will be added to your monthly Shopify bill.
							</p>
						)}

						{trialAlreadyUsed && !isFreePlan && (
							<p>
								You will be charge ${plans[plan].price} each month. This will be added to your monthly
								Shopify bill.
							</p>
						)}
						<p>Do you wish to proceed?</p>
					</TextContainer>
				</Modal.Section>
			</Modal>
		</ModalBackground>
	)
}
