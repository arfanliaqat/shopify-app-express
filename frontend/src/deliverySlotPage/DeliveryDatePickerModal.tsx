import React, { useCallback } from "react"
import _ from "lodash"
import { useState } from "react"
import { Modal } from "@shopify/polaris"
import DeliveryDatePicker from "../common/DeliveryDatePicker"

interface Props {
	date: Date
	onDatesSelected: (dates: Date[]) => void
	onClose: () => void
}

export default function DeliveryDatePickerModal({ date, onDatesSelected, onClose }: Props) {
	const [active, setActive] = useState(true)
	const [selectedDates, setSelectedDates] = useState<Date[]>([date])

	const handleAddDates = useCallback(() => {
		onDatesSelected(selectedDates)
		onClose()
	}, [selectedDates])

	return (
		<div
			className="appModal"
			onMouseDown={(e) => {
				const className = (e.target as any).className || ""
				if (_.isString(className) && className.includes("Polaris-Modal-Dialog")) {
					e.preventDefault()
					onClose()
				}
			}}
		>
			<Modal
				open={active}
				onClose={() => {
					setActive(false)
					onClose()
				}}
				title="Add delivery dates"
				primaryAction={{
					content: "Add dates",
					onAction: handleAddDates
				}}
			>
				<div id="deliveryDatePickerModal">
					<DeliveryDatePicker
						onDatesSelected={(dates) => setSelectedDates(dates)}
						selectedDates={selectedDates}
					/>
				</div>
			</Modal>
		</div>
	)
}
