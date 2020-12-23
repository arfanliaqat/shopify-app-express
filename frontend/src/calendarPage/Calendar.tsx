import React, { useMemo } from "react"
import { Moment } from "moment"
import CalendarDay from "./CalendarDay"
import { Button, Card, Spinner } from "@shopify/polaris"
import { ChevronLeftMinor, ChevronRightMinor } from "@shopify/polaris-icons"
import DeliverySlot from "../models/DeliverySlot"
import { CalendarDates, currentStartOfMonth } from "./CalendarPage"

interface Props {
	slots: DeliverySlot[]
	isLoading: boolean
	calendarDates: CalendarDates
	onDateChange: (year: number, month: number) => void
	onAddSlotClick: (Moment) => void
}

function getDaysBetween(start: Moment, end: Moment, unit: "day" | "week"): Moment[] {
	const days = []
	for (let cursor = start.clone(); cursor.isBefore(end); cursor.add(1, unit)) {
		days.push(cursor.clone())
	}
	return days
}

export default function Calendar({ slots, isLoading, calendarDates, onDateChange, onAddSlotClick }: Props) {
	const slotsByDate: { [date: string]: DeliverySlot } = useMemo(() => {
		if (!slots) {
			return {}
		}
		const result = {}
		slots.forEach((slot) => {
			slot.deliveryDates.forEach((date) => {
				result[date] = slot
			})
		})
		return result
	}, [slots])

	const moveMonth = (delta) => () => {
		const newMonthStart = calendarDates.monthStart.clone().add(delta, "months")
		onDateChange(newMonthStart.year(), newMonthStart.month() + 1)
	}

	const resetMonth = () => {
		onDateChange(currentStartOfMonth.year(), currentStartOfMonth.month() + 1)
	}

	if (isLoading) {
		return (
			<Card>
				<div className="cardLoader">
					<Spinner />
				</div>
			</Card>
		)
	}

	return (
		<Card>
			<div className="App-Calendar">
				<div className="App-Calendar__Header">
					<div className="App-Calendar__CurrentMonth">
						<span>{calendarDates.monthStart.format("MMMM Y")}</span>
					</div>
					<div className="App-Calendar__Nav">
						<Button size="slim" onClick={moveMonth(-1)} icon={<ChevronLeftMinor />} />
						<Button size="slim" onClick={resetMonth}>
							Today
						</Button>
						<Button size="slim" onClick={moveMonth(1)} icon={<ChevronRightMinor />} />
					</div>
				</div>
				<div className="App-Calendar__DayNames">
					{getDaysBetween(
						calendarDates.calendarStart,
						calendarDates.calendarStart.clone().endOf("week"),
						"day"
					).map((day) => {
						const formattedDay = day.format("ddd")
						return (
							<div key={formattedDay} className="App-Calendar__HeaderDay">
								{formattedDay}
							</div>
						)
					})}
				</div>
				{getDaysBetween(calendarDates.calendarStart, calendarDates.calendarEnd, "week").map((weekStart) => (
					<div key={"week" + weekStart.format("YYYY-MM-DD")} className="App-Calendar__Week">
						{getDaysBetween(weekStart, weekStart.clone().endOf("week"), "day").map((day) => {
							const strDay = day.format("YYYY-MM-DD")
							return (
								<CalendarDay
									key={"day" + strDay}
									monthStart={calendarDates.monthStart}
									day={day}
									deliverySlot={slotsByDate[strDay]}
									onAddClick={() => onAddSlotClick(day)}
								/>
							)
						})}
					</div>
				))}
			</div>
		</Card>
	)
}
