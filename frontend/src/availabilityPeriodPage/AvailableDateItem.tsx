import React from "react"
import { Button } from "@shopify/polaris"
import moment, { Moment } from "moment"

interface Props {
	availableDate: Moment
	orders: number
	isNew: boolean
	onNewDateAdded: (Moment) => void
	onDeleteClick: () => void
	isDeleted: boolean
	isNotAvailable: boolean
	isSoldOut: boolean
}

type AvailableDateStatus = "NEW" | "DELETED" | "NOT_AVAILABLE" | "AVAILABLE" | "SOLD_OUT"

const statusMessages: { [key: string]: string } = {
	NEW: "New",
	DELETED: "Deleted",
	NOT_AVAILABLE: "Not available",
	AVAILABLE: "Available",
	SOLD_OUT: "Sold out"
}

function getDateStatus(
	isNew: boolean,
	isDeleted: boolean,
	isNotAvailable: boolean,
	isSoldOut: boolean
): AvailableDateStatus | undefined {
	if (isNew) return "NEW"
	if (isDeleted) return "DELETED"
	if (isNotAvailable) return "NOT_AVAILABLE"
	if (isSoldOut) return "SOLD_OUT"
	return "AVAILABLE"
}

export default function AvailableDateItem({
	availableDate,
	orders,
	isNew,
	onNewDateAdded,
	onDeleteClick,
	isDeleted,
	isNotAvailable,
	isSoldOut
}: Props) {
	const showDeleteButton = (isNew || orders == 0) && !isDeleted && !isNotAvailable
	const showSetAvailableButton = isNotAvailable

	const dateStatus = getDateStatus(isNew, isDeleted, isNotAvailable, isSoldOut)

	return (
		<div className={`availableDateItem ${dateStatus}`}>
			<div className="date">{moment(availableDate).format("ddd D MMM")}</div>
			<div className="orders">{orders} orders</div>
			<div className="status">{statusMessages[dateStatus]}</div>
			<div className="delete">
				{showDeleteButton && <Button onClick={() => onDeleteClick()}>Set unavailable</Button>}
				{showSetAvailableButton && <Button onClick={() => onNewDateAdded(availableDate)}>Set available</Button>}
			</div>
		</div>
	)
}
