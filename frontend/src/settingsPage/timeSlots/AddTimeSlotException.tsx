import React, { useState } from "react"
import { Button, FormLayout, Select } from "@shopify/polaris"
import { ConfigDay, WidgetSettings } from "../../../../widget/src/models/WidgetSettings"

interface Props {
	onAdd: (day: ConfigDay) => void
	widgetSettings: WidgetSettings
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AddTimeSlotException({ onAdd, widgetSettings }: Props) {
	const [selectedDay, setSelectedDay] = useState<ConfigDay>("MONDAY")

	const configDays = Object.keys(widgetSettings.timeSlotsByDay)

	return (
		<div className="addTimeSlot">
			<FormLayout>
				<Select
					label="Exception for"
					onChange={(value) => setSelectedDay(value as ConfigDay)}
					options={daysOfWeek.map((day) => {
						const configDay = day.toUpperCase() as ConfigDay
						return {
							value: configDay,
							label: day,
							disabled: configDays.includes(configDay)
						}
					})}
					value={selectedDay}
				/>
				<Button onClick={() => onAdd(selectedDay)}>Add</Button>
			</FormLayout>
		</div>
	)
}
