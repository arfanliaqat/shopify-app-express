import React from "react"
import { plans } from "../../../backend/src/util/constants"
import { Button, Card } from "@shopify/polaris"
import classNames from "classNames"
import ShopPlan from "../models/ShopPlan"
import { Plan } from "../../../backend/src/shopPlan/shopPlan.model"

interface Props {
	plan: Plan
	currentShopPlan: ShopPlan
	onSelectClick: (plan: Plan) => void
}

export default function PlanCard({ currentShopPlan, plan, onSelectClick }: Props) {
	return (
		<div className={classNames("planCard", { selected: currentShopPlan?.plan == plan })}>
			<Card sectioned>
				<div className="plan">
					<div className="name">{plans[plan].title}</div>
					<div className="price">
						<strong>{plans[plan].price === 0 ? "Free" : "$" + plans[plan].price}</strong> per month
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
						<li>24h support response time</li>
					</ul>
					<Button
						fullWidth
						primary
						onClick={() => onSelectClick(plan)}
						disabled={currentShopPlan?.plan == plan}
					>
						{currentShopPlan?.plan == plan ? "Current plan" : "Select"}
					</Button>
				</div>
			</Card>
		</div>
	)
}
