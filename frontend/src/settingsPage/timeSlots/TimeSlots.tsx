import React, { useContext, useState } from "react"
import { Button, Popover, Tag } from "@shopify/polaris"
import AddTimeSlot from "./AddTimeSlot"
import { ConfigDay, TimeSlot, TimeSlotsByDay } from "../../../../widget/src/models/WidgetSettings"
import _ from "lodash"
import AddTimeSlotException from "./AddTimeSlotException"
import { toTimeSlotDisplay } from "../../../../widget/src/util/dates"
import { SettingsLayoutContext } from "../SettingsLayout"

interface Props {
	configDay: ConfigDay
}

export default function TimeSlots({ configDay }: Props) {
	const { widgetSettings, setWidgetSettings } = useContext(SettingsLayoutContext)
	if (!widgetSettings) return null

	const [addTimeSlotOpen, setAddTimeSlotOpen] = useState<boolean>()
	const [addExceptionOpen, setAddException] = useState<boolean>()

	const timeSlots = widgetSettings.timeSlotsByDay ? widgetSettings.timeSlotsByDay[configDay] || [] : []

	const handleAddTimeSlot = (newTimeSlot: TimeSlot) => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotsByDay)
		timeSlotsByDay[configDay] = _.sortBy([...timeSlots, newTimeSlot], "from")
		setWidgetSettings({ ...widgetSettings, timeSlotsByDay: timeSlotsByDay })
		setAddTimeSlotOpen(false)
	}

	const handleRemoveTimeSlot = (index: number) => () => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotsByDay)
		timeSlotsByDay[configDay] = [...timeSlots]
		timeSlotsByDay[configDay].splice(index, 1)
		setWidgetSettings({ ...widgetSettings, timeSlotsByDay })
	}

	const handleRemoveException = (configDay: ConfigDay) => () => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotsByDay)
		delete timeSlotsByDay[configDay]
		setWidgetSettings({ ...widgetSettings, timeSlotsByDay })
	}

	const handleAddTimeSlotException = (configDay: ConfigDay) => {
		const timeSlotsByDay = _.clone(widgetSettings.timeSlotsByDay) || ({} as TimeSlotsByDay)
		timeSlotsByDay[configDay] = []
		setWidgetSettings({ ...widgetSettings, timeSlotsByDay })
		setAddException(false)
	}

	return (
		<div className="tagsField timeSlotsSection">
			<div className="tags">
				{timeSlots.map((timeSlot, index) => {
					return (
						<Tag key={index} onRemove={handleRemoveTimeSlot(index)}>
							{toTimeSlotDisplay(widgetSettings, timeSlot)}
						</Tag>
					)
				})}
				{timeSlots.length == 0 && <em>No time slots defined yet</em>}
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
							<AddTimeSlotException onAdd={handleAddTimeSlotException} />
						</Popover>
					</div>
				)}
			</div>
		</div>
	)
}
