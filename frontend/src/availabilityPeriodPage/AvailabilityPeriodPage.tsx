import React, { useCallback, useEffect, useMemo, useState } from "react"
import { RouteChildrenProps } from "react-router"
import { Page, Layout, TextField, PageActions, FormLayout } from "@shopify/polaris"
import { useApi } from "../util/useApi"
import { AvailabilityPeriod } from "../models/AvailabilityPeriod"
import moment, { Moment } from "moment"
import ShopResource from "../models/ShopResource"
import _ from "lodash"
import { Toast } from "@shopify/app-bridge-react"
import AvailableDatePickerModal from "./AvailableDatePickerModal"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import QuantityIsSharedCheckbox from "../common/QuantityIsSharedCheckbox"
import AvailabilityDateSection from "./AvailabilityDateSection"
import OrdersWithSharedQuantitySection from "./OrdersWithSharedQuantitySection"

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

export default function AvailabilityPeriodPage({ match, history }: RouteChildrenProps<UrlParams>) {
	const { availabilityPeriodId } = match.params

	const [newDates, setNewDates] = useState<Moment[]>([])
	const [deletedDates, setDeletedDates] = useState<Moment[]>([])
	const [quantity, setQuantity] = useState<number>()
	const [quantityIsShared, setQuantityIsShared] = useState<boolean>()
	const [successMessage, setSuccessMessage] = useState<string>()
	const [addPeriodModalOpen, setAddPeriodModalOpen] = useState<boolean>()

	const [reloadIncrement, setReloadIncrement] = useState<number>(0)
	const { setApiRequest: fetchPeriod, data: pageData, isLoading } = useApi<AvailabilityPeriodPageData>({
		onSuccess: useCallback(() => {
			setNewDates([])
			setDeletedDates([])
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
			history.push(getBackUrl(pageData.shopResource))
		}, [pageData, history])
	})

	useEffect(() => {
		fetchPeriod({
			url: `/availability_periods/${availabilityPeriodId}/page`
		})
	}, [reloadIncrement])

	useEffect(() => {
		if (pageData) {
			if (quantity === undefined) {
				setQuantity(pageData.availabilityPeriod.quantity)
			}
			if (quantityIsShared === undefined) {
				setQuantityIsShared(pageData.availabilityPeriod.quantityIsShared)
			}
		}
	}, [pageData])

	const handleSavePeriod = useCallback(() => {
		savePeriod({
			method: "POST",
			url: `/availability_periods/${availabilityPeriodId}`,
			postData: {
				newDates: newDates.map((date) => moment(date).format(SYSTEM_DATE_FORMAT)),
				deletedDates: deletedDates.map((date) => moment(date).format(SYSTEM_DATE_FORMAT)),
				quantity,
				quantityIsShared
			}
		})
	}, [newDates, deletedDates, quantity, quantityIsShared])

	const handleDeletePeriod = useCallback(() => {
		deletePeriod({
			method: "DELETE",
			url: `/availability_periods/${availabilityPeriodId}`
		})
	}, [newDates, quantity])

	const currentAvailableDates = useMemo(() => (pageData?.availabilityPeriod?.dates || []).map((d) => moment(d)), [
		pageData
	])

	const handleDatesAdded = (addedDates: Moment[]) => {
		const filteredDates = addedDates.filter((d) => !currentAvailableDates.find((cd) => d.isSame(cd, "day")))
		setNewDates(filteredDates)
	}

	const handleDateDeleted = (availableDate: Moment) => {
		const newDateIndex = newDates.findIndex((date) => date.isSame(availableDate, "day"))
		if (newDateIndex >= 0) {
			const newDatesCopy = [...newDates]
			newDatesCopy.splice(newDateIndex, 1)
			setNewDates(newDatesCopy)
		} else if (!deletedDates.find((date) => date.isSame(availableDate, "day"))) {
			setDeletedDates(deletedDates.concat([availableDate]))
		}
	}

	const isDirty =
		(pageData && pageData.availabilityPeriod.quantity != quantity) ||
		(pageData && pageData.availabilityPeriod.quantityIsShared != quantityIsShared) ||
		newDates.length > 0 ||
		deletedDates.length > 0

	if (isLoading || !pageData) {
		return <div />
	}

	const { shopResource, ordersPerDate } = pageData

	const availabilityPeriod = pageData ? AvailabilityPeriod.newInstance(pageData.availabilityPeriod) : null

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
			>
				<Layout>
					<Layout.Section />
					<AvailabilityDateSection
						availabilityPeriod={availabilityPeriod}
						ordersPerDate={pageData.ordersPerDate}
						newDates={newDates}
						deletedDates={deletedDates}
						onNewDateAdded={(newDate) => handleDatesAdded([newDate])}
						onAddAvailabilityDateClick={() => setAddPeriodModalOpen(true)}
						onDateDeleted={handleDateDeleted}
					/>

					<Layout.AnnotatedSection
						title="Shared period quantity"
						description="Define your stock for these available dates"
					>
						<FormLayout>
							<TextField
								label="Quantity"
								type="number"
								value={quantity.toString()}
								onChange={(value) => {
									setQuantity(parseInt(value))
								}}
							/>
							<QuantityIsSharedCheckbox
								checked={quantityIsShared}
								onChange={(isShared) => setQuantityIsShared(isShared)}
							/>
						</FormLayout>
					</Layout.AnnotatedSection>

					<OrdersWithSharedQuantitySection
						availabilityPeriod={availabilityPeriod}
						ordersPerDate={ordersPerDate}
					/>
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
					onDatesSelected={handleDatesAdded}
					onClose={() => setAddPeriodModalOpen(false)}
				/>
			)}
		</div>
	)
}
