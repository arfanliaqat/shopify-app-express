import React, { useCallback, useEffect, useState, useMemo } from "react"
import Calendar from "./Calendar"
import { AvailabilityPeriod } from "../models/AvailabilityPeriod"
import moment, { Moment } from "moment"
import AddPeriodModal from "./AddPeriodModal"
import { useApi } from "../util/useApi"
import { RouteChildrenProps } from "react-router"
import { Page } from "@shopify/polaris"
import { ShopResource } from "../models/ShopResource"
import { OrdersPerDate } from "../../../backend/src/productOrders/productOrders.model"
import ProductThumbnail from "../util/ProductThumbnail"
import { capitalize } from "../util/tools"
import CalendarPageSkeleton from "./CalendarPageSkeleton"

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
	availabilityPeriods: AvailabilityPeriod[]
	ordersPerDate: OrdersPerDate
}

export const currentStartOfMonth = moment().startOf("month")

export default function CalendarPage({ match, history }: RouteChildrenProps<Params>) {
	const params = match.params
	const shopResourceId = params.shopResourceId
	const calendarDates = useMemo(() => getCalendarDatesFromParams(params), [params])

	const [addPeriodDate, setAddPeriodDate] = useState<Moment>()
	const [requestIncrement, setRequestIncrement] = useState<number>(0)
	const { setApiRequest: fetchCalendarPage, data: calendarPageData } = useApi<CalendarPageData>({})

	useEffect(() => {
		fetchCalendarPage({
			method: "GET",
			url: `/resources/${params.shopResourceId}/calendar_page`,
			queryParams: {
				from: calendarDates.calendarStart.format("YYYY-MM-DD"),
				to: calendarDates.calendarEnd.format("YYYY-MM-DD")
			}
		})
	}, [params, calendarDates, requestIncrement])

	const refreshAvailabilityPeriods = useCallback(() => {
		setRequestIncrement(requestIncrement + 1)
	}, [requestIncrement])

	const availabilityPeriods =
		!calendarPageData || !calendarPageData.availabilityPeriods
			? []
			: AvailabilityPeriod.create(calendarPageData.availabilityPeriods)

	if (calendarPageData === undefined) {
		return <CalendarPageSkeleton />
	}

	const { shopResource, ordersPerDate } = calendarPageData

	return (
		<Page
			breadcrumbs={[{ content: "Products", url: "/app" }]}
			title={capitalize(shopResource.title)}
			thumbnail={<ProductThumbnail src={shopResource.imageUrl} />}
		>
			<Calendar
				periods={availabilityPeriods}
				isLoading={false}
				calendarDates={calendarDates}
				ordersPerDate={ordersPerDate}
				onDateChange={(year, month) => {
					const strMonth = month < 10 ? "0" + month : "" + month
					const url = `/app/resources/${params.shopResourceId}/calendar/${year}/${strMonth}`
					history.push(url)
				}}
				onAddPeriodClick={setAddPeriodDate}
			/>
			{addPeriodDate && (
				<AddPeriodModal
					shopResourceId={shopResourceId}
					date={addPeriodDate}
					onClose={() => {
						setAddPeriodDate(null)
					}}
					onSuccess={() => {
						setAddPeriodDate(null)
						refreshAvailabilityPeriods()
					}}
				/>
			)}
		</Page>
	)
}
