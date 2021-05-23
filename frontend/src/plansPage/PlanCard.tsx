import React, { useState } from "react"
import { plans } from "../../../backend/src/util/constants"
import { Button, Card } from "@shopify/polaris"
import classNames from "classnames"
import ShopPlan from "../models/ShopPlan"
import { Plan } from "../../../backend/src/shopPlan/shopPlan.model"
import { useApi } from "../util/useApi"
import { Redirect } from "@shopify/app-bridge/actions"
import { shopifyConfig } from "../models/ShopifyConfig"
import { useAppBridge } from "@shopify/app-bridge-react"
import { useHistory } from "react-router"

interface Props {
	plan: Plan
	currentShopPlan: ShopPlan
}

export default function PlanCard({ currentShopPlan, plan }: Props) {
	const app = useAppBridge()
	const history = useHistory()

	const [isLoading, setIsLoading] = useState(false)

	const { setApiRequest: callChoosePlan } = useApi<{ url: string }>(
		{
			onSuccess: (data) => {
				if (data.url) {
					const redirect = Redirect.create(app)
					redirect.dispatch(Redirect.Action.REMOTE, data.url)
				} else {
					history.push("/app?shopOrigin=" + shopifyConfig.host)
				}
			}
		},
		app
	)

	const handleChosePlanClick = () => {
		setIsLoading(true)
		callChoosePlan({
			method: "post",
			url: "/choose_plan",
			postData: {
				plan
			}
		})
	}

	const isFreePlan = plans[plan].price === 0

	return (
		<div className={classNames("planCard", { selected: currentShopPlan?.plan == plan })}>
			<Card sectioned>
				<div className="plan">
					<div className="name">{plans[plan].title}</div>
					<div className="price">
						<strong>{isFreePlan ? "Free" : "$" + plans[plan].price}</strong> {isFreePlan ? "" : "per month"}
					</div>
					<ul>
						<li>Customizable date picker</li>
						<li>Unlimited products</li>
						<li>Unlimited traffic</li>
						<li>
							{plans[plan].orderLimit == -1 ? (
								<>
									<strong>Unlimited</strong> orders
								</>
							) : (
								<>
									Up to <strong>{plans[plan].orderLimit}</strong> orders per month
								</>
							)}
						</li>
						<li>
							<strong>{plans[plan].supportResponseTime}h</strong> support response time
						</li>
					</ul>
					<Button fullWidth primary onClick={handleChosePlanClick} disabled={currentShopPlan?.plan == plan}>
						{currentShopPlan?.plan == plan ? "Current plan" : "Select"}
					</Button>
				</div>
			</Card>
		</div>
	)
}
