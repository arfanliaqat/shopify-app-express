import React, { useState } from "react"
import { Button, Popover, Tag } from "@shopify/polaris"
import AddTimeSlot from "./AddTimeSlot"
import { ConfigDay, TimeSlot, TimeSlotByDay, WidgetSettings } from "../../../../widget/src/models/WidgetSettings"
import _ from "lodash"
import AddTimeSlotException from "./AddTimeSlotException"

interface Props {
	configDay: ConfigDay
	widgetSettings: WidgetSettings
	onWidgetSettingsChange: (settings: WidgetSettings) => void
	hasExceptions: boolean
}

export default function TimeSlots({ widgetSettings, onWidgetSettingsChange, configDay, hasExceptions }: Props) {
	const [addTimeSlotOpen, setAddTimeSlotOpen] = useState<boolean>()
	const [addExceptionOpen, setAddException] = useState<boolean>()

	const timeSlots = widgetSettings.timeSlotsByDay ? widgetSettings.timeSlotsByDay[configDay] || [] : []

	const handleAddTimeSlot = (newTimeSlot: TimeSlot) => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotByDay)
		timeSlotsByDay[configDay] = _.sortBy([...timeSlots, newTimeSlot], "from")
		onWidgetSettingsChange({ ...widgetSettings, timeSlotsByDay: timeSlotsByDay })
		setAddTimeSlotOpen(false)
	}

	const handleRemoveTimeSlot = (index: number) => () => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotByDay)
		timeSlotsByDay[configDay] = [...timeSlots]
		timeSlotsByDay[configDay].splice(index, 1)
		onWidgetSettingsChange({ ...widgetSettings, timeSlotsByDay })
	}

	const handleRemoveException = (configDay: ConfigDay) => () => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotByDay)
		delete timeSlotsByDay[configDay]
		onWidgetSettingsChange({ ...widgetSettings, timeSlotsByDay })
	}

	const handleAddTimeSlotException = (configDay: ConfigDay) => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotByDay)
		timeSlotsByDay[configDay] = []
		onWidgetSettingsChange({ ...widgetSettings, timeSlotsByDay })
		setAddException(false)
	}

	return (
		<div className="timeSlotsSection">
			<div className="tags">
				{timeSlots.map((timeSlot, index) => {
					return (
						<Tag key={index} onRemove={handleRemoveTimeSlot(index)}>
							{`${timeSlot.from} - ${timeSlot.to}`}
						</Tag>
					)
				})}
				{timeSlots.length == 0 && <em>No time slots defined</em>}
			</div>
			<div className="buttons">
				<div className="buttonHolder">
					<Popover
						activator={
							<Button onClick={() => setAddTimeSlotOpen((active) => !active)} disclosure>
								Add time slot
							</Button>
						}
						active={addTimeSlotOpen}
						onClose={() => setAddTimeSlotOpen(false)}
						preferredAlignment="left"
					>
						<AddTimeSlot onAdd={handleAddTimeSlot} />
					</Popover>
				</div>
				{configDay != "DEFAULT" && (
					<div className="buttonHolder">
						<Button onClick={handleRemoveException(configDay)}>Remove exception</Button>
					</div>
				)}
				{!!widgetSettings.timeSlotsByDay && configDay == "DEFAULT" && (
					<div className="buttonHolder">
						<Popover
							activator={
								<Button onClick={() => setAddException((active) => !active)} disclosure>
									Add exception
								</Button>
							}
							active={addExceptionOpen}
							onClose={() => setAddException(false)}
							preferredAlignment="left"
						>
							<AddTimeSlotException onAdd={handleAddTimeSlotException} widgetSettings={widgetSettings} />
						</Popover>
					</div>
				)}
			</div>
		</div>
	)
}
