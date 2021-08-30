import React, { useContext } from "react"
import { ConfigDay } from "../../../../widget/src/models/WidgetSettings"
import { Checkbox, Card, FormLayout } from "@shopify/polaris"
import TimeSlots from "./TimeSlots"
import { capitalize } from "../../util/tools"
import { SettingsLayoutContext } from "../SettingsLayout"

interface Props {}

const configDays: ConfigDay[] = [
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY",
	"DEFAULT"
]

export default function TimeSlotCard({}: Props) {
	const { widgetSettings, setWidgetSettings } = useContext(SettingsLayoutContext)
	if (!widgetSettings) return null

	const handleTimeSlotsEnabled = (timeSlotsEnabled: boolean) => {
		setWidgetSettings({ ...widgetSettings, timeSlotsEnabled })
	}

	const handleMandatoryTimeSlotChecked = (mandatoryTimeSlot: boolean) => {
		setWidgetSettings({ ...widgetSettings, mandatoryTimeSlot })
	}

	const handleTimeSlotDeselectedFirstChecked = (timeSlotDeselectedFirst: boolean) => {
		setWidgetSettings({ ...widgetSettings, timeSlotDeselectedFirst })
	}

	const hasExceptions = Object.keys(widgetSettings.timeSlotsByDay || {}).length > 1
	return (
		<Card title="Time slot settings">
			<Card.Section>
				<FormLayout>
					<Checkbox
						label="Enable the time slot selector"
						checked={widgetSettings.timeSlotsEnabled}
						onChange={(value) => handleTimeSlotsEnabled(value)}
					/>
					{widgetSettings.timeSlotsEnabled &&
						configDays.map((configDay) => {
							if (
								(widgetSettings.timeSlotsByDay &&
									widgetSettings.timeSlotsByDay[configDay] !== undefined) ||
								configDay == "DEFAULT"
							) {
								return (
									<div className="timeSlotsConfigDay" key={configDay}>
										{configDay == "DEFAULT" && hasExceptions && (
											<div className="label">On any other day:</div>
										)}
										{configDay != "DEFAULT" && (
											<div className="label">On {capitalize(configDay)}:</div>
										)}
										<TimeSlots configDay={configDay} />
									</div>
								)
							} else {
								return undefined
							}
						})}
					<Checkbox
						label="A time slot must be selected to be able to add a product to the cart"
						checked={widgetSettings.mandatoryTimeSlot}
						onChange={(value) => handleMandatoryTimeSlotChecked(value)}
					/>
					<Checkbox
						label="The time slot appears deselected at first"
						checked={widgetSettings.timeSlotDeselectedFirst}
						onChange={(value) => handleTimeSlotDeselectedFirstChecked(value)}
					/>
				</FormLayout>
			</Card.Section>
		</Card>
	)
}
