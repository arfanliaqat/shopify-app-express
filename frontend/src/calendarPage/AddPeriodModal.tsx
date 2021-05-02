import React, { useCallback, useState } from "react"
import moment, { Moment } from "moment"
import { TextField, Modal, FormLayout } from "@shopify/polaris"
import { useApi } from "../util/useApi"
import _ from "lodash"
import AvailableDatePicker from "../common/AvailableDatePicker"
import QuantityIsSharedCheckbox from "../common/QuantityIsSharedCheckbox"
import { useAppBridge } from "@shopify/app-bridge-react"

interface Props {
	shopResourceId: string
	date: Moment
	onSuccess: () => void
	onClose: () => void
}

export default function AddPeriodModal({ shopResourceId, date, onSuccess, onClose }: Props) {
	const app = useAppBridge()

	const [active, setActive] = useState(true)
	const [selectedDates, setSelectedDates] = useState<Moment[]>([date])
	const [quantity, setQuantity] = useState<number>(10)
	const [quantityIsShared, setQuantityIsShared] = useState<boolean>(true)

	const { setApiRequest: submitForm, isLoading: isSubmitting } = useApi(
		{
			onSuccess: useCallback(() => {
				onSuccess()
			}, [onSuccess])
		},
		app
	)

	const handleAddPeriodClick = useCallback(() => {
		submitForm({
			method: "POST",
			url: `/resources/${shopResourceId}/availability_periods`,
			postData: {
				dates: selectedDates.map((date) => moment(date).format("YYYY-MM-DD")),
				quantity,
				quantityIsShared
			}
		})
	}, [submitForm, selectedDates, quantity, shopResourceId, quantityIsShared])

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
				title="Add availability period"
				primaryAction={{
					content: "Add period",
					onAction: handleAddPeriodClick
				}}
				loading={isSubmitting}
			>
				<div id="AddPeriodModal" className="appModal">
					<FormLayout>
						<AvailableDatePicker
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
						<QuantityIsSharedCheckbox
							checked={quantityIsShared}
							onChange={(isShared) => setQuantityIsShared(isShared)}
						/>
					</FormLayout>
				</div>
			</Modal>
		</div>
	)
}
