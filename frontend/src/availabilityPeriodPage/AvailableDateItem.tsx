import React from "react"
import { Button } from "@shopify/polaris"
import moment, { Moment } from "moment"
import classNames from "classnames"

interface Props {
	availableDate: Moment
	orders: number
	isNew: boolean
	onNewDateAdded: (Moment) => void
	onDeleteClick: () => void
	isDeleted: boolean
	isNotAvailable: boolean
	isSoldOut: boolean
	isPaused: boolean
	onPauseDateClick: (Moment) => void
	onResumeDateClick: (Moment) => void
	isDraft: boolean
}

type AvailableDateStatus = "NEW" | "DELETED" | "NOT_AVAILABLE" | "AVAILABLE" | "SOLD_OUT" | "PAUSED"

const statusMessages: { [key: string]: string } = {
	NEW: "New",
	DELETED: "Deleted",
	NOT_AVAILABLE: "Not available",
	AVAILABLE: "Available",
	SOLD_OUT: "Sold out",
	PAUSED: "Paused"
}

function getDateStatus(
	isNew: boolean,
	isDeleted: boolean,
	isNotAvailable: boolean,
	isSoldOut: boolean,
	isPaused: boolean
): AvailableDateStatus | undefined {
	if (isNew) return "NEW"
	if (isDeleted) return "DELETED"
	if (isNotAvailable) return "NOT_AVAILABLE"
	if (isSoldOut) return "SOLD_OUT"
	if (isPaused) return "PAUSED"
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
	isSoldOut,
	isPaused,
	onPauseDateClick,
	onResumeDateClick,
	isDraft
}: Props) {
	const showDeleteButton = (isNew || orders == 0) && !isDeleted && !isNotAvailable
	const showSetAvailableButton = isNotAvailable
	const dateStatus = getDateStatus(isNew, isDeleted, isNotAvailable, isSoldOut, isPaused)
	const showPauseDateButton = dateStatus == "AVAILABLE" && orders != 0
	const showResumeDateButton = dateStatus == "PAUSED"

	return (
		<div className={classNames("availableDateItem", dateStatus, { isDraft })}>
			<div className="date">{moment(availableDate).format("ddd D MMM")}</div>
			<div className="orders">{orders} orders</div>
			<div className="status">
				{statusMessages[dateStatus]} {isDraft ? <span className="draft">(unsaved)</span> : ""}
			</div>
			<div className="delete">
				{showDeleteButton && <Button onClick={() => onDeleteClick()}>Set unavailable</Button>}
				{showSetAvailableButton && <Button onClick={() => onNewDateAdded(availableDate)}>Set available</Button>}
				{showPauseDateButton && <Button onClick={() => onPauseDateClick(availableDate)}>Pause selling</Button>}
				{showResumeDateButton && (
					<Button onClick={() => onResumeDateClick(availableDate)}>Resume selling</Button>
				)}
			</div>
		</div>
	)
}
