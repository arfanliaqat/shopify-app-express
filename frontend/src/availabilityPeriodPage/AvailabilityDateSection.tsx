import React, { useMemo } from "react"
import { Button, Card, Layout, ResourceList } from "@shopify/polaris"
import AvailableDateItem from "./AvailableDateItem"
import moment, { Moment } from "moment"
import AvailabilityPeriod from "../models/AvailabilityPeriod"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"

interface Props {
	availabilityPeriod: AvailabilityPeriod
	ordersPerDate: OrdersPerDate
	newDates: Moment[]
	deletedDates: Moment[]
	onDateDeleted: (Moment) => void
	onAddAvailabilityDateClick: () => void
}

export default function AvailabilityDateSection({
	availabilityPeriod,
	newDates,
	deletedDates,
	ordersPerDate,
	onDateDeleted,
	onAddAvailabilityDateClick
}: Props) {
	const availableDates = useMemo(() => {
		return []
			.concat((availabilityPeriod?.dates || []).map((d) => moment(d)))
			.concat(newDates)
			.sort((d1, d2) => {
				if (d1.isBefore(d2)) return -1
				if (d1.isAfter(d2)) return 1
				return 0
			})
	}, [availabilityPeriod, newDates])

	const getOrdersForDate = (availableDate: Moment): number => {
		const strDate = availableDate.format(SYSTEM_DATE_FORMAT)
		return ordersPerDate[strDate] || 0
	}

	const isNewDate = (availableDate: Moment): boolean => {
		return newDates.find((nd) => nd.isSame(availableDate, "day")) != undefined
	}

	const isDeletedDate = (availableDate: Moment): boolean => {
		return deletedDates.find((deletedDate) => deletedDate.isSame(availableDate, "day")) != undefined
	}

	return (
		<Layout.AnnotatedSection
			title="Available dates"
			description="You can either add or remove days sharing the same quantity. Orders will be attached to a day, but the stock is common."
		>
			<Card>
				<ResourceList
					items={availableDates}
					renderItem={(availableDate) => (
						<ResourceList.Item id="product" onClick={() => {}}>
							<AvailableDateItem
								availableDate={availableDate}
								orders={getOrdersForDate(availableDate)}
								isNew={isNewDate(availableDate)}
								onDeleteClick={() => onDateDeleted(availableDate)}
								isDeleted={isDeletedDate(availableDate)}
							/>
						</ResourceList.Item>
					)}
				/>
			</Card>
			<div className="buttonHolder">
				<Button onClick={() => onAddAvailabilityDateClick()}>Add availability dates</Button>
			</div>
		</Layout.AnnotatedSection>
	)
}
