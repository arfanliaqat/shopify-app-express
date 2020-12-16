import React from "react"
import { Button } from "@shopify/polaris"
import moment, { Moment } from "moment"

interface Props {
	deliveryDate: Moment
	orders: number
	isNew: boolean
	onDeleteClick: () => void
	isDeleted: boolean
}

export default function DeliveryDateItem({ deliveryDate, orders, isNew, onDeleteClick, isDeleted }: Props) {
	const showDeleteButton = (isNew || orders == 0) && !isDeleted
	return (
		<div className="deliveryDateItem">
			<div className="date">{moment(deliveryDate).format("ddd D MMM")}</div>
			<div className="orders">{orders} orders</div>
			<div className="draftState">
				{isNew && "New"}
				{isDeleted && "Deleted"}
			</div>
			<div className="delete">{showDeleteButton && <Button onClick={() => onDeleteClick()}>Delete</Button>}</div>
		</div>
	)
}
