import React, { useMemo } from "react"
import { Button, Card, Layout, ResourceList } from "@shopify/polaris"
import AvailableDateItem from "./AvailableDateItem"
import moment, { Moment } from "moment"
import { AvailabilityPeriod } from "../models/AvailabilityPeriod"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import { getDaysBetween } from "../util/tools"

interface Props {
	availabilityPeriod: AvailabilityPeriod
	ordersPerDate: OrdersPerDate
	newDates: Moment[]
	deletedDates: Moment[]
	pausedDates: Moment[]
	onNewDateAdded: (Moment) => void
	onDateDeleted: (Moment) => void
	onAddAvailabilityDateClick: () => void
	onPauseDateClick: (Moment) => void
	onResumeDateClick: (Moment) => void
}

export default function AvailabilityDateSection({
	availabilityPeriod,
	newDates,
	deletedDates,
	pausedDates,
	ordersPerDate,
	onNewDateAdded,
	onDateDeleted,
	onAddAvailabilityDateClick,
	onPauseDateClick,
	onResumeDateClick
}: Props) {
	const availableDates = useMemo(() => {
		return []
			.concat((availabilityPeriod?.availableDates || []).map((d) => moment(d)))
			.concat(newDates)
			.sort((d1, d2) => {
				if (d1.isBefore(d2)) return -1
				if (d1.isAfter(d2)) return 1
				return 0
			})
	}, [availabilityPeriod, newDates])

	const strAvailableDates = useMemo(() => new Set(availableDates.map((date) => date.format(SYSTEM_DATE_FORMAT))), [
		availableDates
	])

	const firstDate = availableDates[0]
	const lastDate = availableDates[availableDates.length - 1]
	const allDates = useMemo(() => getDaysBetween(firstDate, lastDate.clone().add(1, "day"), "day"), [
		firstDate,
		lastDate
	])

	const getOrdersForDate = (availableDate: Moment): number => {
		const strDate = availableDate.format(SYSTEM_DATE_FORMAT)
		return ordersPerDate[strDate] || 0
	}

	const isNewDate = (availableDate: Moment): boolean => {
		return newDates.find((date) => date.isSame(availableDate, "day")) != undefined
	}

	const isDeletedDate = (availableDate: Moment): boolean => {
		return deletedDates.find((date) => date.isSame(availableDate, "day")) != undefined
	}

	const isPausedDate = (availableDate: Moment): boolean => {
		return pausedDates.find((date) => date.isSame(availableDate, "day")) != undefined
	}

	return (
		<Layout.AnnotatedSection
			title="Available dates"
			description="You can either add or remove days sharing the same quantity. Orders will be attached to a day, but the stock is common."
		>
			<Card>
				<ResourceList
					items={allDates}
					renderItem={(date) => {
						const strDay = date.format(SYSTEM_DATE_FORMAT)
						const isNew = isNewDate(date)
						const isDeleted = isDeletedDate(date)
						const isPaused = isPausedDate(date)
						const isDraft = isNew || isDeleted || isPaused != availabilityPeriod.isPaused(strDay)
						return (
							<ResourceList.Item id="product" onClick={() => {}}>
								<AvailableDateItem
									availableDate={date}
									orders={getOrdersForDate(date)}
									isNotAvailable={!strAvailableDates.has(strDay)}
									isNew={isNew}
									onNewDateAdded={onNewDateAdded}
									onDeleteClick={() => onDateDeleted(date)}
									isDeleted={isDeleted}
									isSoldOut={availabilityPeriod.isSoldOut(ordersPerDate, date)}
									isPaused={isPaused}
									onPauseDateClick={onPauseDateClick}
									onResumeDateClick={onResumeDateClick}
									isDraft={isDraft}
								/>
							</ResourceList.Item>
						)
					}}
				/>
			</Card>
			<div className="buttonHolder">
				<Button onClick={() => onAddAvailabilityDateClick()}>Add availability dates</Button>
			</div>
		</Layout.AnnotatedSection>
	)
}
