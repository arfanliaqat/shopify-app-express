import React, { useCallback, useEffect, useMemo, useState } from "react"
import { RouteChildrenProps } from "react-router"
import { Page, ResourceList, Card, Layout, Button, TextField, PageActions, Badge } from "@shopify/polaris"
import { useApi } from "../util/useApi"
import AvailabilityPeriod from "../models/AvailabilityPeriod"
import moment, { Moment } from "moment"
import ShopResource from "../models/ShopResource"
import _ from "lodash"
import { Toast } from "@shopify/app-bridge-react"
import AvailableDatePickerModal from "./AvailableDatePickerModal"
import AvailableDateItem from "./AvailableDateItem"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"

interface UrlParams {
	availabilityPeriodId: string
}

type OrdersPerDate = { [strDate: string]: number }

interface AvailabilityPeriodPageData {
	shopResource: ShopResource
	availabilityPeriod: AvailabilityPeriod
	ordersPerDate: OrdersPerDate
}

function getTitle(availabilityPeriod: AvailabilityPeriod) {
	const startDate = moment(_.first(availabilityPeriod.dates))
	if (availabilityPeriod.dates.length > 1) {
		const endDate = moment(_.last(availabilityPeriod.dates))
		return `Availability period: ${startDate.format("D MMM")} - ${endDate.format("D MMM")}`
	} else {
		return `Availability period: ${startDate.format("D MMM")}`
	}
}

function getBackUrl(shopResource: ShopResource) {
	return `/app/resources/${shopResource.id}/calendar/${moment().format("YYYY/MM")}`
}

function getTotalOrders(ordersPerDate: OrdersPerDate) {
	return Object.values(ordersPerDate).reduce((total, orders) => total + orders, 0)
}

export default function AvailabilityPeriodPage({ match, history }: RouteChildrenProps<UrlParams>) {
	const { availabilityPeriodId } = match.params

	const [newDates, setNewDates] = useState<Moment[]>([])
	const [deletedDates, setDeletedDates] = useState<Moment[]>([])
	const [quantity, setQuantity] = useState<number>()
	const [successMessage, setSuccessMessage] = useState<string>()
	const [addPeriodModalOpen, setAddPeriodModalOpen] = useState<boolean>()

	const [reloadIncrement, setReloadIncrement] = useState<number>(0)
	const { setApiRequest: fetchPeriod, data: availabilityPeriodPageData, isLoading } = useApi<
		AvailabilityPeriodPageData
	>({
		onSuccess: useCallback(() => {
			setNewDates([])
		}, [])
	})
	const { setApiRequest: savePeriod, isLoading: isSavingPeriod } = useApi({
		onSuccess: useCallback(() => {
			setSuccessMessage("Availability period saved!")
			setReloadIncrement(reloadIncrement + 1)
		}, [reloadIncrement])
	})
	const { setApiRequest: deletePeriod, isLoading: isDeletingPeriod } = useApi({
		onSuccess: useCallback(() => {
			history.push(getBackUrl(availabilityPeriodPageData.shopResource))
		}, [availabilityPeriodPageData, history])
	})

	useEffect(() => {
		fetchPeriod({
			url: `/availability_periods/${availabilityPeriodId}/page`
		})
	}, [reloadIncrement])

	useEffect(() => {
		if (availabilityPeriodPageData && quantity === undefined) {
			setQuantity(availabilityPeriodPageData.availabilityPeriod.quantity)
		}
	}, [availabilityPeriodPageData])

	const handleSavePeriod = useCallback(() => {
		savePeriod({
			method: "POST",
			url: `/availability_periods/${availabilityPeriodId}`,
			postData: {
				newDates: newDates.map((date) => moment(date).format(SYSTEM_DATE_FORMAT)),
				deletedDates: deletedDates.map((date) => moment(date).format(SYSTEM_DATE_FORMAT)),
				quantity
			}
		})
	}, [newDates, deletedDates, quantity])

	const handleDeletePeriod = useCallback(() => {
		deletePeriod({
			method: "DELETE",
			url: `/availability_periods/${availabilityPeriodId}`
		})
	}, [newDates, quantity])

	const currentAvailableDates = (availabilityPeriodPageData?.availabilityPeriod?.dates || []).map((d) => moment(d))

	const handleSelectedDates = (selectedDates: Moment[]) => {
		const filteredDates = selectedDates.filter((d) => !currentAvailableDates.find((cd) => d.isSame(cd, "day")))
		setNewDates(filteredDates)
	}

	const availableDates = useMemo(() => {
		return []
			.concat(currentAvailableDates)
			.concat(newDates)
			.sort((d1, d2) => {
				if (d1.isBefore(d2)) return -1
				if (d1.isAfter(d2)) return 1
				return 0
			})
	}, [availabilityPeriodPageData, newDates])

	const isNewDate = (availableDate: Moment): boolean => {
		return newDates.find((nd) => nd.isSame(availableDate, "day")) != undefined
	}

	const isDeletedDate = (availableDate: Moment): boolean => {
		return deletedDates.find((deletedDate) => deletedDate.isSame(availableDate, "day")) != undefined
	}

	const handleDeleteDateClick = (availableDate: Moment) => () => {
		const newDateIndex = newDates.findIndex((date) => date.isSame(availableDate, "day"))
		if (newDateIndex >= 0) {
			const newDatesCopy = [...newDates]
			newDatesCopy.splice(newDateIndex, 1)
			setNewDates(newDatesCopy)
		} else if (!deletedDates.find((date) => date.isSame(availableDate, "day"))) {
			setDeletedDates(deletedDates.concat([availableDate]))
		}
	}

	const getOrdersForDate = (availableDate: Moment): number => {
		if (!availabilityPeriodPageData) return 0
		const strDate = availableDate.format(SYSTEM_DATE_FORMAT)
		return availabilityPeriodPageData.ordersPerDate[strDate] || 0
	}

	const isDirty =
		(availabilityPeriodPageData && availabilityPeriodPageData.availabilityPeriod.quantity != quantity) ||
		newDates.length > 0 ||
		deletedDates.length > 0

	if (isLoading || !availabilityPeriodPageData) {
		return <div />
	}

	const { shopResource, availabilityPeriod, ordersPerDate } = availabilityPeriodPageData

	const totalOrders = getTotalOrders(ordersPerDate)
	const remainingQuantity = Math.max(0, availabilityPeriod.quantity - totalOrders)
	const isSoldOut = remainingQuantity == 0

	return (
		<div id="availabilityPeriodPage">
			{successMessage && <Toast content={successMessage} onDismiss={() => setSuccessMessage(undefined)} />}
			<Page
				breadcrumbs={[
					{ content: "Products", url: "/" },
					{
						content: shopResource.title,
						url: getBackUrl(shopResource)
					}
				]}
				title={getTitle(availabilityPeriod)}
				titleMetadata={isSoldOut && <Badge status="warning">Sold out</Badge>}
			>
				<Layout>
					<Layout.Section />
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
											onDeleteClick={handleDeleteDateClick(availableDate)}
											isDeleted={isDeletedDate(availableDate)}
										/>
									</ResourceList.Item>
								)}
							/>
						</Card>
						<div className="buttonHolder">
							<Button onClick={() => setAddPeriodModalOpen(true)}>Add available dates</Button>
						</div>
					</Layout.AnnotatedSection>

					<Layout.AnnotatedSection
						title="Shared period quantity"
						description="Define your stock for these available dates"
					>
						<TextField
							label="Quantity"
							type="number"
							value={quantity.toString()}
							onChange={(value) => {
								setQuantity(parseInt(value))
							}}
						/>
					</Layout.AnnotatedSection>

					<Layout.AnnotatedSection
						title="Remaining quantity"
						description="Number of items available on these dates"
					>
						<div>
							{totalOrders == 0 ? "No" : totalOrders} order{totalOrders == 1 ? "" : "s"} made out of{" "}
							{availabilityPeriod.quantity} available.
						</div>
						<div>
							<strong>
								{remainingQuantity} order{remainingQuantity == 1 ? "" : "s"} remaining
							</strong>
						</div>
					</Layout.AnnotatedSection>
				</Layout>
				<PageActions
					primaryAction={{
						content: "Save",
						onAction: handleSavePeriod,
						loading: isSavingPeriod,
						disabled: !isDirty
					}}
					secondaryActions={[
						{
							content: "Delete",
							destructive: true,
							onAction: handleDeletePeriod,
							loading: isDeletingPeriod
						}
					]}
				/>
			</Page>
			{addPeriodModalOpen && (
				<AvailableDatePickerModal
					date={moment(_.last(availabilityPeriod.dates)).add(1, "day")}
					onDatesSelected={handleSelectedDates}
					onClose={() => setAddPeriodModalOpen(false)}
				/>
			)}
		</div>
	)
}
