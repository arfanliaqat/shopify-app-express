import React from "react"
import { Layout } from "@shopify/polaris"
import { AvailabilityPeriod } from "../models/AvailabilityPeriod"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { OrderCount, OrderCounts } from "./OrderCount"

interface Props {
	availabilityPeriod: AvailabilityPeriod
	ordersPerDate: OrdersPerDate
}

export default function OrdersWithSharedQuantitySection({ availabilityPeriod, ordersPerDate }: Props) {
	const totalOrders = availabilityPeriod.getTotalOrders(ordersPerDate)
	const remainingQuantity = Math.max(0, availabilityPeriod.quantity - totalOrders)
	return (
		<Layout.AnnotatedSection title="Orders" description="Current state for this availability period.">
			<OrderCounts>
				<OrderCount label="Quantity" count={availabilityPeriod.quantity} />
				<OrderCount label="Total orders" count={totalOrders} />
				<OrderCount label="Remaining quantity" count={remainingQuantity} />
			</OrderCounts>
		</Layout.AnnotatedSection>
	)
}
