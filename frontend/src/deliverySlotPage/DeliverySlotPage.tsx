import React, { useCallback, useEffect, useMemo, useState } from "react"
import { RouteChildrenProps } from "react-router"
import {
	Page,
	ResourceList,
	Card,
	Layout,
	Button,
	TextField,
	PageActions,
	isNewDesignLanguageColor
} from "@shopify/polaris"
import { useApi } from "../util/useApi"
import DeliverySlot from "../models/DeliverySlot"
import moment, { Moment } from "moment"
import ShopResource from "../models/ShopResource"
import _ from "lodash"
import { Toast } from "@shopify/app-bridge-react"
import DeliveryDatePickerModal from "./DeliveryDatePickerModal"

interface UrlParams {
	deliverySlotId: string
}

interface DeliverySlotPageData {
	shopResource: ShopResource
	deliverySlot: DeliverySlot
}

function getTitle(deliverySlot: DeliverySlot) {
	const startDate = moment(_.first(deliverySlot.deliveryDates))
	if (deliverySlot.deliveryDates.length > 1) {
		const endDate = moment(_.last(deliverySlot.deliveryDates))
		return `Delivery slot: ${startDate.format("D MMM")} - ${endDate.format("D MMM")}`
	} else {
		return `Delivery slot: ${startDate.format("D MMM")}`
	}
}

function getBackUrl(shopResource: ShopResource) {
	return `/app/resources/${shopResource.id}/calendar/${moment().format("YYYY/MM")}`
}

export default function DeliverySlotPage({ match, history }: RouteChildrenProps<UrlParams>) {
	const { deliverySlotId } = match.params

	const [newDates, setNewDates] = useState<Moment[]>([])
	const [quantity, setQuantity] = useState<number>()
	const [successMessage, setSuccessMessage] = useState<string>()
	const [addSlotModalOpen, setAddSlotModalOpen] = useState<boolean>()

	const [reloadIncrement, setReloadIncrement] = useState<number>(0)
	const { setApiRequest: fetchSlot, data: deliverySlotPageData, isLoading } = useApi<DeliverySlotPageData>({
		onSuccess: useCallback(() => {
			setNewDates([])
		}, [])
	})
	const { setApiRequest: saveSlot, isLoading: isSavingSlot } = useApi({
		onSuccess: useCallback(() => {
			setSuccessMessage("Delivery slot saved!")
			setReloadIncrement(reloadIncrement + 1)
		}, [])
	})
	const { setApiRequest: deleteSlot, isLoading: isDeletingSlot } = useApi({
		onSuccess: useCallback(() => {
			history.push(getBackUrl(deliverySlotPageData.shopResource))
		}, [deliverySlotPageData, history])
	})

	useEffect(() => {
		fetchSlot({
			url: `/delivery_slots/${deliverySlotId}/page`
		})
	}, [reloadIncrement])

	useEffect(() => {
		if (deliverySlotPageData && quantity === undefined) {
			setQuantity(deliverySlotPageData.deliverySlot.quantity)
		}
	}, [deliverySlotPageData])

	const handleSaveSlot = useCallback(() => {
		saveSlot({
			method: "POST",
			url: `/delivery_slots/${deliverySlotId}`,
			postData: {
				newDates: newDates.map((date) => moment(date).format("YYYY-MM-DD")),
				quantity
			}
		})
	}, [newDates, quantity])

	const handleDeleteSlot = useCallback(() => {
		deleteSlot({
			method: "DELETE",
			url: `/delivery_slots/${deliverySlotId}`
		})
	}, [newDates, quantity])

	const currentDeliveryDates = (deliverySlotPageData?.deliverySlot?.deliveryDates || []).map((d) => moment(d))

	const handleSelectedDates = (selectedDates: Moment[]) => {
		const filteredDates = selectedDates.filter((d) => !currentDeliveryDates.find((cd) => d.isSame(cd, "day")))
		setNewDates(filteredDates)
	}

	const deliveryDates = useMemo(() => {
		return []
			.concat(currentDeliveryDates)
			.concat(newDates)
			.sort((d1, d2) => {
				if (d1.isBefore(d2)) return -1
				if (d1.isAfter(d2)) return 1
				return 0
			})
	}, [deliverySlotPageData, newDates])

	const isNewDate = (deliveryDate: Moment): boolean => {
		return newDates.find((nd) => nd.isSame(deliveryDate, "day")) != undefined
	}

	if (isLoading || !deliverySlotPageData) {
		return <div />
	}

	const { shopResource, deliverySlot } = deliverySlotPageData

	return (
		<div id="deliverySlotPage">
			{successMessage && <Toast content={successMessage} onDismiss={() => setSuccessMessage(undefined)} />}
			<Page
				breadcrumbs={[
					{ content: "Products", url: "/" },
					{
						content: shopResource.title,
						url: getBackUrl(shopResource)
					}
				]}
				title={getTitle(deliverySlot)}
			>
				<Layout>
					<Layout.Section />
					<Layout.AnnotatedSection
						title="Delivery dates"
						description="You can either add or remove days sharing the same quantity. Orders will be attached to a day, but the stock is common."
					>
						<Card>
							<ResourceList
								items={deliveryDates}
								renderItem={(deliveryDate) => (
									<ResourceList.Item id="product" onClick={() => {}}>
										<div className="deliveryDateItem">
											<div className="date">{moment(deliveryDate).format("ddd D MMM")}</div>
											{isNewDate(deliveryDate) && <div className="newDate">New</div>}
										</div>
									</ResourceList.Item>
								)}
							/>
						</Card>
						<div className="buttonHolder">
							<Button onClick={() => setAddSlotModalOpen(true)}>Add delivery dates</Button>
						</div>
					</Layout.AnnotatedSection>

					<Layout.AnnotatedSection
						title="Shared slot quantity"
						description="Define your stock for these delivery dates"
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
				</Layout>
				<PageActions
					primaryAction={{
						content: "Save",
						onAction: handleSaveSlot,
						loading: isSavingSlot
					}}
					secondaryActions={[
						{
							content: "Delete",
							destructive: true,
							onAction: handleDeleteSlot,
							loading: isDeletingSlot
						}
					]}
				/>
			</Page>
			{addSlotModalOpen && (
				<DeliveryDatePickerModal
					date={moment(_.last(deliverySlot.deliveryDates)).add(1, "day")}
					onDatesSelected={handleSelectedDates}
					onClose={() => setAddSlotModalOpen(false)}
				/>
			)}
		</div>
	)
}
