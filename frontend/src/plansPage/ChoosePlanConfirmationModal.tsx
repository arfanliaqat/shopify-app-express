import React, { useState } from "react"
import { useApi } from "../util/useApi"
import ModalBackground from "../util/ModalBackground"
import { Modal, TextContainer } from "@shopify/polaris"
import { Plan, planNames } from "../../../backend/src/shopPlan/shopPlan.model"
import { plans } from "../../../backend/src/util/constants"

interface Props {
	plan: Plan
	onClose: () => void
}

export default function ChoosePlanConfirmationModal({ plan, onClose }: Props) {
	const [active, setActive] = useState(true)
	const [isLoading, setIsLoading] = useState(false)

	const { setApiRequest: resetSettings } = useApi<{ url: string }>({
		onSuccess: (data) => {
			window.location.href = data.url
		}
	})

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
						<p>
							After the 14-day trial period you'll be charge ${plans[plan].price} per month. This will be
							added on your monthly Shopify bill.
						</p>
						<p>Do you wish to proceed?</p>
					</TextContainer>
				</Modal.Section>
			</Modal>
		</ModalBackground>
	)
}
