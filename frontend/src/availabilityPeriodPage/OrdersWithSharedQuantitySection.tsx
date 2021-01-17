import React from "react"
import { Card, Layout } from "@shopify/polaris"
import { AvailabilityPeriod } from "../models/AvailabilityPeriod"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { SectionMessages } from "./AvailabilityPeriodPage"

interface Props {
	availabilityPeriod: AvailabilityPeriod
	ordersPerDate: OrdersPerDate
	sectionMessages: SectionMessages
}

export default function OrdersWithSharedQuantitySection({ availabilityPeriod, ordersPerDate, sectionMessages }: Props) {
	const totalOrders = availabilityPeriod.getTotalOrders(ordersPerDate)
	const remainingQuantity = Math.max(0, availabilityPeriod.quantity - totalOrders)
	return (
		<Layout.AnnotatedSection title={sectionMessages.orders.title} description={sectionMessages.orders.description}>
			<OrdersCountWithSharing>
				<OrdersCount label="Quantity" count={availabilityPeriod.quantity} />
				<OrdersCount label="Total orders" count={totalOrders} />
				<OrdersCount label="Remaining quantity" count={remainingQuantity} />
			</OrdersCountWithSharing>
		</Layout.AnnotatedSection>
	)
}

export function OrdersCountWithSharing({ children }: { children: any }) {
	return (
		<div className="OrdersCountWithSharing">
			<Card>
				<div className="inner">{children}</div>
			</Card>
		</div>
	)
}

interface OrderCountProps {
	label: string
	count: number
}

export function OrdersCount({ label, count }: OrderCountProps) {
	return (
		<div className="orderCount">
			<div className="label">{label}</div>
			<div className="count">{count}</div>
		</div>
	)
}
