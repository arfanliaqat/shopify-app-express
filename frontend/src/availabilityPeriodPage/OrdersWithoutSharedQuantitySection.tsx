import React from "react"
import { Layout, ResourceList, Card } from "@shopify/polaris"
import { AvailabilityPeriod } from "../models/AvailabilityPeriod"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import moment from "moment"

interface Props {
	availabilityPeriod: AvailabilityPeriod
	ordersPerDate: OrdersPerDate
}

export default function OrdersWithoutSharedQuantitySection({ availabilityPeriod, ordersPerDate }: Props) {
	return (
		<Layout.AnnotatedSection title="Orders" description="Current state for this availability period.">
			<div className="orderCountWithoutSharing">
				<Card>
					<ResourceList
						items={availabilityPeriod.availableDates}
						renderItem={(strDate) => {
							const date = moment(strDate, SYSTEM_DATE_FORMAT)
							const orders = ordersPerDate[strDate] || 0
							const remaining = Math.max(0, availabilityPeriod.quantity - orders)
							return (
								<ResourceList.Item id={strDate} onClick={() => {}}>
									<div className="item">
										<div className="date">{date.format("ddd D MMM")}</div>
										<div className="orders">
											<strong>{orders}</strong> order{orders == 1 ? "" : "s"} made
										</div>
										<div className="remaining">
											<strong>{remaining}</strong> remaining
										</div>
									</div>
								</ResourceList.Item>
							)
						}}
					/>
				</Card>
			</div>
		</Layout.AnnotatedSection>
	)
}
