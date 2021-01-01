import React, { useMemo } from "react"
import CalendarDay from "./CalendarDay"
import { Button, Card, Spinner } from "@shopify/polaris"
import { ChevronLeftMinor, ChevronRightMinor } from "@shopify/polaris-icons"
import AvailabilityPeriod from "../models/AvailabilityPeriod"
import { CalendarDates, currentStartOfMonth } from "./CalendarPage"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { getDaysBetween } from "../util/tools"

interface Props {
	periods: AvailabilityPeriod[]
	isLoading: boolean
	calendarDates: CalendarDates
	ordersPerDate?: OrdersPerDate
	onDateChange: (year: number, month: number) => void
	onAddPeriodClick: (Moment) => void
}

export default function Calendar({
	periods,
	isLoading,
	calendarDates,
	onDateChange,
	onAddPeriodClick,
	ordersPerDate
}: Props) {
	const availabilityByDate: { [date: string]: AvailabilityPeriod } = useMemo(() => {
		if (!periods) {
			return {}
		}
		const result = {}
		periods.forEach((period) => {
			if (period.fromDate && period.toDate) {
				for (const cursor = period.fromDate.clone(); !cursor.isAfter(period.toDate); cursor.add(1, "day")) {
					result[cursor.format(SYSTEM_DATE_FORMAT)] = period
				}
			}
		})
		return result
	}, [periods])

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
			<div className="availabilityCalendar">
				<div className="grid">
					<div className="header">
						<div className="currentMonth">
							<span>{calendarDates.monthStart.format("MMMM Y")}</span>
						</div>
						<div className="nav">
							<Button size="slim" onClick={moveMonth(-1)} icon={<ChevronLeftMinor />} />
							<Button size="slim" onClick={resetMonth}>
								Today
							</Button>
							<Button size="slim" onClick={moveMonth(1)} icon={<ChevronRightMinor />} />
						</div>
					</div>
					<div className="dayNames">
						{getDaysBetween(
							calendarDates.calendarStart,
							calendarDates.calendarStart.clone().endOf("week"),
							"day"
						).map((day) => {
							const formattedDay = day.format("ddd")
							return (
								<div key={formattedDay} className="headerDay">
									{formattedDay}
								</div>
							)
						})}
					</div>
					{getDaysBetween(calendarDates.calendarStart, calendarDates.calendarEnd, "week").map((weekStart) => (
						<div key={"week" + weekStart.format("YYYY-MM-DD")} className="week">
							{getDaysBetween(weekStart, weekStart.clone().endOf("week"), "day").map((day) => {
								const strDay = day.format("YYYY-MM-DD")
								return (
									<CalendarDay
										key={"day" + strDay}
										monthStart={calendarDates.monthStart}
										day={day}
										availabilityPeriod={availabilityByDate[strDay]}
										ordersPerDate={ordersPerDate}
										onAddClick={() => onAddPeriodClick(day)}
									/>
								)
							})}
						</div>
					))}
				</div>
			</div>
		</Card>
	)
}
