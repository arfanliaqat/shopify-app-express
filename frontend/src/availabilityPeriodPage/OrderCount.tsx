import React from "react"
import { Card } from "@shopify/polaris"

export function OrderCounts({ children }: { children: any }) {
	return (
		<div className="orderCounts">
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

export function OrderCount({ label, count }: OrderCountProps) {
	return (
		<div className="orderCount">
			<div className="label">{label}</div>
			<div className="count">{count}</div>
		</div>
	)
}
