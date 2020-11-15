import React, { useCallback, useState } from "react"
import moment, { Moment } from "moment"
import { TextField, Modal } from "@shopify/polaris"
import { useApi } from "../util/useApi"
import _ from "lodash"
import DeliveryDatePicker from "../common/DeliveryDatePicker"

interface Props {
	shopResourceId: string
	date: Moment
	onSuccess: () => void
	onClose: () => void
	onUnexpectedError?: () => void
}

export default function AddSlotModal({ shopResourceId, date, onSuccess, onClose }: Props) {
	const [active, setActive] = useState(true)
	const [selectedDates, setSelectedDates] = useState<Date[]>([date.toDate()])
	const [quantity, setQuantity] = useState<number>(10)

	const { setApiRequest: submitForm, isLoading: isSubmitting } = useApi({
		onSuccess: useCallback(() => {
			onSuccess()
		}, [])
	})

	const handleAddSlotClick = useCallback(() => {
		submitForm({
			method: "POST",
			url: `/resources/${shopResourceId}/slots`,
			postData: {
				dates: selectedDates.map((date) => moment(date).format("YYYY-MM-DD")),
				quantity
			}
		})
	}, [selectedDates, quantity])

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
				title="Add delivery slot"
				primaryAction={{
					content: "Add slot",
					onAction: handleAddSlotClick
				}}
				loading={isSubmitting}
			>
				<div id="AddSlotModal">
					<DeliveryDatePicker
						selectedDates={selectedDates}
						onDatesSelected={(selectedDates) => setSelectedDates(selectedDates)}
					/>
					<TextField
						label="Quantity"
						type="number"
						value={quantity.toString()}
						onChange={(value) => {
							setQuantity(parseInt(value))
						}}
					/>
				</div>
			</Modal>
		</div>
	)
}
