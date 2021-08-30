import React, { useContext, useState } from "react"
import { Button, FormLayout, Select } from "@shopify/polaris"
import { ConfigDay } from "../../../../widget/src/models/WidgetSettings"
import { SettingsLayoutContext } from "../SettingsLayout"

interface Props {
	onAdd: (day: ConfigDay) => void
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AddTimeSlotException({ onAdd }: Props) {
	const { widgetSettings } = useContext(SettingsLayoutContext)
	const [selectedDay, setSelectedDay] = useState<ConfigDay>("MONDAY")

	if (!widgetSettings) return null

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
