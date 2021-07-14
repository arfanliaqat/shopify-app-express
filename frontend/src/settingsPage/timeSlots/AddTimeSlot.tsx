import React, { useState } from "react"
import { FormLayout, Select, Button } from "@shopify/polaris"
import { TimeSlot } from "../../../../widget/src/models/WidgetSettings"
import { SelectOption } from "@shopify/polaris/dist/types/latest/src/components/Select/Select"

interface Props {
	onAdd: (timeSlot: TimeSlot) => void
}

function getTimeSlotOptions() {
	const options = [] as SelectOption[]
	for (let i = 0; i < 24; i++) {
		const hour = (i < 10 ? "0" + i : i) + ""
		options.push({ value: hour + ":00", label: hour + ":00" })
		options.push({ value: hour + ":30", label: hour + ":30" })
	}
	options.push({ value: "23:59", label: "23:59" })
	return options
}

const timeSlotOptions = getTimeSlotOptions()

function toMinutesOfDay(time: string): number {
	const timeSplit = time.split(":")
	return parseInt(timeSplit[0]) * 60 + parseInt(timeSplit[1])
}

export default function AddTimeSlot({ onAdd }: Props) {
	const [from, setFrom] = useState("09:00")
	const [fromError, setFromError] = useState(false)
	const [to, setTo] = useState("18:00")
	const [toError, setToError] = useState(false)

	const handleAddClick = () => {
		const fromInMinutes = toMinutesOfDay(from)
		const toInMinutes = toMinutesOfDay(to)
		const hasError = fromInMinutes >= toInMinutes
		setFromError(hasError)
		setToError(hasError)
		if (!hasError) {
			onAdd({ from, to })
		}
	}

	return (
		<div className="addTimeSlot">
			<FormLayout>
				<FormLayout.Group condensed>
					<Select label="From" onChange={setFrom} error={fromError} options={timeSlotOptions} value={from} />
					<Select label="To" onChange={setTo} error={toError} options={timeSlotOptions} value={to} />
				</FormLayout.Group>
				<Button onClick={handleAddClick}>Add</Button>
			</FormLayout>
		</div>
	)
}
