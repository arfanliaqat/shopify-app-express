import React, { useCallback, useEffect, useState, useMemo } from "react"
import Calendar from "./Calendar"
import DeliverySlot from "../models/DeliverySlot"
import moment, { Moment } from "moment"
import AddSlotModal from "./AddSlotModal"
import { useApi } from "../util/useApi"
import { RouteChildrenProps } from "react-router"
import { Page } from "@shopify/polaris"
import ShopResource from "../models/ShopResource"

interface Params {
	shopResourceId: string
	year: string
	month: string
}

export interface CalendarDates {
	monthStart: Moment
	calendarStart: Moment
	calendarEnd: Moment
}

export function getCalendarDatesFromParams(params: Params) {
	const monthStart = moment(`${params.year}/${params.month}/01`)
	return {
		monthStart: monthStart.clone(),
		calendarStart: monthStart.clone().startOf("week"),
		calendarEnd: monthStart.clone().endOf("month").endOf("week")
	}
}

interface CalendarPageData {
	shopResource: ShopResource
	deliverySlots: DeliverySlot[]
}

export const currentStartOfMonth = moment().startOf("month")

export default function CalendarPage({ match, history }: RouteChildrenProps<Params>) {
	const params = match.params
	const shopResourceId = params.shopResourceId
	const calendarDates = useMemo(() => getCalendarDatesFromParams(params), [params])

	const [addSlotDate, setAddSlotDate] = useState<Moment>()
	const [requestIncrement, setRequestIncrement] = useState<number>(0)
	const { setApiRequest: fetchDeliverySlots, data: calendarPageData } = useApi<CalendarPageData>({})

	useEffect(() => {
		fetchDeliverySlots({
			method: "GET",
			url: `/resources/${params.shopResourceId}/calendar_page`,
			queryParams: {
				from: calendarDates.calendarStart.format("YYYY-MM-DD"),
				to: calendarDates.calendarEnd.format("YYYY-MM-DD")
			}
		})
	}, [params, calendarDates, requestIncrement])

	const refreshDeliverySlots = useCallback(() => {
		setRequestIncrement(requestIncrement + 1)
	}, [requestIncrement])

	if (calendarPageData == undefined) {
		return <div />
	}
	const { shopResource, deliverySlots } = calendarPageData

	return (
		<Page breadcrumbs={[{ content: "Products", url: "/app" }]} title={shopResource.title}>
			<Calendar
				slots={deliverySlots}
				isLoading={false}
				calendarDates={calendarDates}
				onDateChange={(year, month) => {
					const strMonth = month < 10 ? "0" + month : "" + month
					const url = `/app/resources/${params.shopResourceId}/calendar/${year}/${strMonth}`
					history.push(url)
				}}
				onAddSlotClick={setAddSlotDate}
			/>
			{addSlotDate && (
				<AddSlotModal
					shopResourceId={shopResourceId}
					date={addSlotDate}
					onClose={() => {
						setAddSlotDate(null)
					}}
					onSuccess={() => {
						setAddSlotDate(null)
						refreshDeliverySlots()
					}}
				/>
			)}
		</Page>
	)
}
