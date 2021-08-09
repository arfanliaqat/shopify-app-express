import { h } from "preact"
import { useCallback, useEffect, useMemo, useState } from "preact/hooks"
import { appName, appUrl } from "./constants"
import DropdownDatePicker from "./DropdownDatePicker"
import CalendarDatePicker from "./CalendarDatePicker"
import { getCssFromWidgetStyles } from "./util/widgetStyles"
import { ProductAvailabilityData } from "./models/ProductAvailabilityData"
import { ConfigDay, WidgetSettings } from "./models/WidgetSettings"
import { AvailableDate } from "./models/AvailableDate"
import classNames from "classnames"
import _ from "lodash"

import {
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_SHOW_ON_PAGE,
	SYSTEM_DATE_FORMAT,
	TAG_DATE_FORMAT
} from "../../backend/src/util/constants"
import moment, { Moment } from "moment"
import TimeSlotPicker, { getTimeSlotsByConfigDay } from "./TimeSlotPicker"
import axios from "axios"
import { anchorElement } from "./app"
import { fetchCartData, fetchDatePickerVisibility, fetchWidgetSettings } from "./util/api"
import { generateAvailableDates } from "./util/generateAvailableDates"
import TextInputDatePicker from "./TextInputDatePicker"
import { toTimeSlotDisplay } from "./util/dates"

export type FormAttributeName = "properties" | "attributes"

function getIsPreviewMode() {
	return anchorElement?.getAttribute("data-preview") == "true"
}

function getPreviewData(): ProductAvailabilityData {
	return JSON.parse(anchorElement?.getAttribute("data-preview-data"))
}

function getProductId() {
	return anchorElement?.getAttribute("data-productid")
}

function getIsDisabled() {
	return anchorElement?.getAttribute("data-disabled") == "true"
}

async function fetchAvailabilityForProduct(): Promise<ProductAvailabilityData> {
	const productId = getProductId()
	if (!productId) {
		throw "[Buunto] productId not found"
	}
	const response = await axios.get(appUrl + "/product_availability/" + productId + "?_ts=" + Date.now(), {
		headers: {
			Accept: "application/json"
		}
	})
	if (response.status != 200) {
		throw "[Buunto] failed to fetch product availability"
	}
	return (await response.data) as ProductAvailabilityData
}

function isSubmitButtonClick(e: any) {
	if (e.target.tagName == "BUTTON" && e.target.type == "submit") {
		return true
	} else {
		const button = e.target.closest("button")
		return button?.type == "submit"
	}
}

export interface Props {
	isCartPage?: boolean
	isCartDrawer?: boolean
	widgetSettings?: WidgetSettings
}

function initialFetchingCartData(settings?: WidgetSettings) {
	if (!settings) {
		return false
	}
	const showOnPage = settings.showOnPage || DEFAULT_SHOW_ON_PAGE
	if (settings.singleDatePerOrder && showOnPage == "PRODUCT") return true
	else if (settings.filterType == "COLLECTIONS" && showOnPage == "CART") return true
	else return settings.filterType == "PRODUCT_TAGS" && showOnPage == "CART"
}

export default function AvailableDatePicker({ isCartPage, isCartDrawer, widgetSettings }: Props) {

	const [productAvailabilityData, setProductAvailabilityData] = useState<ProductAvailabilityData>(widgetSettings ? {
		settings: widgetSettings,
		availableDates: [],
	} : undefined)

	const [selectedAvailableDate, setSelectedAvailableDate] = useState<string>(undefined)
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(undefined)
	const [dateFormError, setDateFormError] = useState<string>(undefined)
	const [timeSlotFormError, setTimeSlotFormError] = useState<string>(undefined)
	const [orderDate, setOrderDate] = useState<Moment>(undefined)
	const [fetchingCartData, setFetchingCartData] = useState<boolean>(initialFetchingCartData(productAvailabilityData?.settings))
	const [productVariantIds, setProductVariantIds] = useState<number[]>(undefined)
	const [isVisibleOverride, setIsVisibleOverride] = useState<boolean>(undefined)
	const [fetchingDatePickerVisibility, setFetchingDatePickerVisibility] = useState<boolean>(false)

	const settings = productAvailabilityData?.settings
	const showOnPage = settings ? settings.showOnPage || DEFAULT_SHOW_ON_PAGE : undefined

	const availableDates: AvailableDate[] = useMemo(() => {
		if (appName == "STOCK_BY_DATE") {
			return productAvailabilityData?.availableDates || []
		} else {
			if (orderDate) {
				return [{
					date: orderDate.format(SYSTEM_DATE_FORMAT),
					isSoldOut: false
				} as AvailableDate]
			} else {
				return generateAvailableDates(settings)
			}
		}
	}, [settings, orderDate])

	useEffect(() => {
		if (fetchingCartData) {
			const showOnPage = settings.showOnPage || DEFAULT_SHOW_ON_PAGE
			if (!isCartPage && showOnPage == "PRODUCT" && settings.singleDatePerOrder) {
				fetchCartData().then((cart) => {
					const dateTagLabel = settings.messages.dateTagLabel || DEFAULT_DATE_TAG_LABEL
					const item = (cart.items || []).find(item => item.properties && !!item.properties[dateTagLabel])
					if (item) {
						const strTagDate = item.properties[dateTagLabel]
						const tagDate = moment(strTagDate, TAG_DATE_FORMAT, settings.locale)
						setOrderDate(tagDate)
						setSelectedAvailableDate(tagDate.format(SYSTEM_DATE_FORMAT))
					}
					setFetchingCartData(false)
				})
			} else if (isCartPage && showOnPage == "CART" && settings.filterType != "ALL") {
				fetchCartData().then((cart) => {
					setProductVariantIds(_.uniq((cart.items || []).map(item => item.id) as number[]))
					setFetchingCartData(false)
					setFetchingDatePickerVisibility(true)
				})
			}
		}
	}, [settings, fetchingCartData, setFetchingDatePickerVisibility])

	useEffect(() => {
		if (fetchingDatePickerVisibility && productVariantIds) {
			fetchDatePickerVisibility(productVariantIds).then((isVisible) => {
				setIsVisibleOverride(isVisible)
				setFetchingDatePickerVisibility(false)
			})
		}
	}, [productVariantIds, fetchingDatePickerVisibility])

	useEffect(() => {
		if (settings) {
			if (!settings.dateDeselectedFirst) {
				const firstAvailableDate = availableDates.find(ad => !ad.isSoldOut)
				if (firstAvailableDate) {
					setSelectedAvailableDate(firstAvailableDate.date)
				}
				if (settings.timeSlotsEnabled && !settings.timeSlotDeselectedFirst && firstAvailableDate) {
					const configDay = moment(firstAvailableDate.date).format("dddd").toUpperCase() as ConfigDay
					const timeSlots = getTimeSlotsByConfigDay(settings.timeSlotsByDay, configDay)
					if (timeSlots.length > 0) {
						setSelectedTimeSlot(toTimeSlotDisplay(widgetSettings, timeSlots[0]))
					}
				}
			}
		}
	}, [settings, availableDates])

	const widgetStyles = useMemo(() => {
		if (settings) {
			return getCssFromWidgetStyles(settings.styles)
		}
	}, [settings])

	const isPreviewMode = getIsPreviewMode()
	const isDisabled = getIsDisabled()
	useEffect(() => {
		if (isPreviewMode) {
			setProductAvailabilityData(getPreviewData())
		}
	}, [])

	useEffect(() => {
		if (anchorElement) {
			anchorElement.addEventListener("previewDataUpdated", () => {
				const previewDate = getPreviewData()
				setProductAvailabilityData(previewDate)
				setDateFormError(undefined)
			}, false)
		}
	}, [])

	useEffect(() => {
		if (!isPreviewMode && !settings) {
			if (appName == "STOCK_BY_DATE") {
				async function fetchStockByDateData() {
					const data = await fetchAvailabilityForProduct()
					setProductAvailabilityData(data)
				}

				fetchStockByDateData()
			} else {
				async function fetchDatePickerData() {
					const data = await fetchWidgetSettings()
					setProductAvailabilityData({
						settings: data,
						availableDates: [],
					})
					setFetchingCartData(initialFetchingCartData(data))
				}

				fetchDatePickerData()
			}
		}
	}, [])

	const isVisible = useCallback(() => {
		if (isPreviewMode) return true
		if (isDisabled) return false
		if (settings === undefined || !settings.isVisible) return false
		if (isVisibleOverride === false) return false
		const showOnPage = settings.showOnPage || DEFAULT_SHOW_ON_PAGE
		return isCartPage ? showOnPage == "CART" : showOnPage == "PRODUCT"
	}, [isPreviewMode, settings, isDisabled, isCartPage, isVisibleOverride])

	const hasDateError = useCallback(() => {
		return !isPreviewMode && anchorElement && isVisible() && settings?.mandatoryDateSelect && !selectedAvailableDate
	}, [settings, isPreviewMode, anchorElement, isVisible, selectedAvailableDate])

	const hasTimeSlotError = useCallback(() => {
		return !isPreviewMode && anchorElement && isVisible() && settings?.mandatoryTimeSlot && !selectedTimeSlot
	}, [settings, isPreviewMode, anchorElement, isVisible, selectedTimeSlot])

	useEffect(() => {
		if (!isPreviewMode && anchorElement && isVisible()) {
			const form = anchorElement.closest("form")
			const onSubmit = (e) => {
				if (isCartPage || isSubmitButtonClick(e)) {
					setDateFormError(hasDateError() ? settings.messages.noDateSelectedError : undefined)
					setTimeSlotFormError(hasTimeSlotError() ? settings.messages.noTimeSlotSelectedError : undefined)
					if (hasDateError() || hasTimeSlotError()) {
						e.preventDefault()
						return false
					}
				}
			}
			if (form) {
				form.addEventListener(isCartPage ? "submit" : "click", onSubmit)
			}
			return () => {
				form.removeEventListener(isCartPage ? "submit" : "click", onSubmit)
			}
		}
	}, [selectedAvailableDate, settings, isVisible, hasDateError, hasTimeSlotError])

	useEffect(() => {
		if (productAvailabilityData && availableDates.length == 0) {
			setDateFormError(settings.messages.noAvailableDatesError)
		}
	}, [productAvailabilityData, availableDates, settings])

	const handleAvailableDateSelect = (value: string | undefined) => {
		setDateFormError(undefined)
		setSelectedAvailableDate(value)
	}

	const handleTimeSlotSelect = (value: string | undefined) => {
		setTimeSlotFormError(undefined)
		setSelectedTimeSlot(value)
	}

	if (!productAvailabilityData || fetchingCartData || fetchingDatePickerVisibility || !isVisible()) return undefined

	const selectedDay = moment(selectedAvailableDate, SYSTEM_DATE_FORMAT)?.format("dddd")?.toUpperCase() as ConfigDay

	const formAttributeName = showOnPage == "CART" ? "attributes" : "properties"

	return (
		<div className={classNames("buunto-date-picker", {
			"buunto-cart-page": isCartPage,
			"buunto-product-page": !isCartPage,
			"buunto-cart-drawer": isCartDrawer
		})}>
			{widgetStyles && <style>{widgetStyles}</style>}
			<div className="buunto-date-picker-label">{settings.messages.datePickerLabel}</div>
			{settings.pickerType == "DROPDOWN" && availableDates.length > 0 && <DropdownDatePicker
				availableDates={availableDates}
				onSelect={handleAvailableDateSelect}
				selectedAvailableDate={selectedAvailableDate}
				settings={settings}
				formError={dateFormError}
				formAttributeName={formAttributeName}
				showOnlyOnDatePerOrderMessage={!!orderDate}
			/>}
			{settings.pickerType == "CALENDAR" && availableDates.length > 0 && <CalendarDatePicker
				availableDates={availableDates}
				onSelect={handleAvailableDateSelect}
				settings={settings}
				formError={dateFormError}
				formAttributeName={formAttributeName}
				showOnlyOnDatePerOrderMessage={!!orderDate}
			/>}
			{settings.pickerType == "TEXT_INPUT" && availableDates.length > 0 && <TextInputDatePicker
				availableDates={availableDates}
				onSelect={handleAvailableDateSelect}
				settings={settings}
				formError={dateFormError}
				formAttributeName={formAttributeName}
				showOnlyOnDatePerOrderMessage={!!orderDate}
			/>}
			{settings.timeSlotsEnabled && Object.keys(settings.timeSlotsByDay || {}).length > 0 && <TimeSlotPicker
				formError={timeSlotFormError}
				settings={settings}
				onSelect={handleTimeSlotSelect}
				selectedTimeSlot={selectedTimeSlot}
				configDay={selectedDay || "DEFAULT"}
				formAttributeName={formAttributeName}
			/>}
		</div>
	)
}
