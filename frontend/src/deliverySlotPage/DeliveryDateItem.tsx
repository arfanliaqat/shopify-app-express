import React from "react"
import { ResourceList } from "@shopify/polaris"
import moment, { Moment } from "moment"

interface Props {
	deliveryDate: Moment
	orders: number
	isNew: boolean
}

export default function DeliveryDateItem({ deliveryDate, orders, isNew }: Props) {
	return (
		<div className="deliveryDateItem">
			<div className="date">{moment(deliveryDate).format("ddd D MMM")}</div>
			<div className="orders">{orders} orders</div>
			<div className="newDate">{isNew && "New"}</div>
		</div>
	)
}
