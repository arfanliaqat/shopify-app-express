import React, { useState } from "react"
import _ from "lodash"
import { Modal } from "@shopify/polaris"
import AvailableDatePicker from "../common/AvailableDatePicker"
import moment, { Moment } from "moment"

interface Props {
	date: Moment
	onDatesSelected: (dates: Moment[]) => void
	onClose: () => void
}

export default function AvailableDatePickerModal({ date, onDatesSelected, onClose }: Props) {
	const [active, setActive] = useState(true)
	const [selectedDates, setSelectedDates] = useState<Moment[]>([date])

	const handleAddDates = () => {
		onDatesSelected(selectedDates)
		onClose()
	}

	return (
		<div
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
				title="Add available dates"
				primaryAction={{
					content: "Add dates",
					onAction: handleAddDates
				}}
			>
				<div id="availableDatePickerModal" className="appModal">
					<AvailableDatePicker
						onDatesSelected={(dates) => {
							setSelectedDates(dates.map((d) => moment(d)))
						}}
						selectedDates={selectedDates}
					/>
				</div>
			</Modal>
		</div>
	)
}
