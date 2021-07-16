import { h } from "preact"
import { useCallback, useEffect, useMemo, useState } from "preact/hooks"
import { appName, appUrl } from "./constants"
import DropdownDatePicker from "./DropdownDatePicker"
import CalendarDatePicker from "./CalendarDatePicker"
import { getCssFromWidgetStyles } from "./util/widgetStyles"
import { ProductAvailabilityData } from "./models/ProductAvailabilityData"
import { ConfigDay, WidgetSettings } from "./models/WidgetSettings"
import { AvailableDate } from "./models/AvailableDate"
import { getMoment } from "./util/dates"
import { getDaysBetween } from "../../frontend/src/util/tools"
import classNames from "classnames"

import {
	DEFAULT_DATE_TAG_LABEL, DEFAULT_SHOW_ON_PAGE, DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE,
	SYSTEM_DATE_FORMAT,
	SYSTEM_DATETIME_FORMAT,
	TAG_DATE_FORMAT
} from "../../backend/src/util/constants"
import moment, { Moment } from "moment"
import TimeSlotPicker, { getTimeSlotsByConfigDay, toTimeSlotValue } from "./TimeSlotPicker"
import axios from "axios"
import { anchorElement } from "./app"

export type FormAttributeName = "properties" | "attributes"

function generateAvailableDates(settings: WidgetSettings): AvailableDate[] {
	if (!settings) return []
	const today = getMoment(settings).startOf("day")
	const cutOffTime = moment(moment().format(SYSTEM_DATE_FORMAT) + " " + settings.cutOffTime + ":00", SYSTEM_DATETIME_FORMAT)
	const needsExtraDay = moment().isAfter(cutOffTime, "minute")
	const firstDay = today.clone().add(settings.firstAvailableDateInDays, "days")
	const lastDay = today.clone().add(settings.lastAvailableDateInWeeks, "weeks").endOf("weeks")
	const availableWeekDaysSet = new Set(settings.availableWeekDays)
	const disabledDatesSet = new Set(settings.disabledDates)
	const availableDates = getDaysBetween(firstDay, lastDay, "day")
		.filter((date) => {
			const matchesPattern = availableWeekDaysSet.has(date.format("dddd").toUpperCase())
			if (!matchesPattern) return false
			const matchesDisabledDate = disabledDatesSet.has(date.format(SYSTEM_DATE_FORMAT))
			return !matchesDisabledDate
		})
		.map((date) => ({
			date: date.format(SYSTEM_DATE_FORMAT),
			isSoldOut: false
		}))
	if (needsExtraDay) {
		availableDates.shift()
	}
	return availableDates
}

function getCurrentDomain() {
	let url = window.location.href
	const start = url.indexOf("://") + 3
	url = url.substring(start)
	const end = url.indexOf("/")
	return url.substring(0, end)
}

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

async function fetchWidgetSettings(): Promise<WidgetSettings> {
	const response = await axios.get(appUrl + "/settings?shop=" + getCurrentDomain() + "&_ts=" + Date.now(), {
		headers: {
			Accept: "application/json"
		}
	})
	if (response.status == 403) {
		const data = await response.data
		throw `[Buunto] ${data.reason}`
	}
	if (response.status != 200) {
		throw "[Buunto] failed to fetch widget settings"
	}
	return (await response.data) as WidgetSettings
}

function isSubmitButtonClick(e: any) {
	if (e.target.tagName == "BUTTON" && e.target.type == "submit") {
		return true
	} else {
		const button = e.target.closest("button")
		return button?.type == "submit"
	}
	return false
}

export interface Props {
	isCartPage?: boolean
}

export default function AvailableDatePicker({ isCartPage }: Props) {
	const [productAvailabilityData, setProductAvailabilityData] = useState<ProductAvailabilityData>(undefined)
	const [selectedAvailableDate, setSelectedAvailableDate] = useState<string>(undefined)
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(undefined)
	const [dateFormError, setDateFormError] = useState<string>(undefined)
	const [timeSlotFormError, setTimeSlotFormError] =  useState<string>(undefined)
	const [orderDate, setOrderDate] = useState<Moment>(undefined)
	const [fetchingCartData, setFetchingCartData] = useState<boolean>(false)

	const settings = productAvailabilityData?.settings

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
			async function fetchOrderDate() {
				const response = await axios.get("/cart.js", {
					headers: {
						Accept: "application/json"
					}
				})
				const cart = await response.data as any
				const dateTagLabel = settings.messages.dateTagLabel || DEFAULT_DATE_TAG_LABEL
				const item = cart.items.find(item => !!item.properties[dateTagLabel])
				if (item) {
					const strTagDate = item.properties[dateTagLabel]
					const tagDate = moment(strTagDate, TAG_DATE_FORMAT, settings.locale)
					setOrderDate(tagDate)
					setSelectedAvailableDate(tagDate.format(SYSTEM_DATE_FORMAT))
				}
				setFetchingCartData(false)
			}

			fetchOrderDate()
		}
	}, [settings, fetchingCartData])

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
						setSelectedTimeSlot(toTimeSlotValue(timeSlots[0]))
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
		if (!isPreviewMode) {
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
					setFetchingCartData(data.singleDatePerOrder)
				}

				fetchDatePickerData()
			}

		}
	}, [])

	const isVisible = useCallback(() => {
		if (isPreviewMode) return true
		if (isDisabled) return false
		if (settings === undefined || !settings.isVisible) return false
		const showOnPage = settings.showOnPage || DEFAULT_SHOW_ON_PAGE
		return isCartPage ? showOnPage == "CART" : showOnPage == "PRODUCT"
	}, [isPreviewMode, settings, isDisabled, isCartPage])

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
		setSelectedAvailableDate(value)
	}

	const handleTimeSlotSelect = (value: string | undefined) => {
		setSelectedTimeSlot(value)
	}

	if (!productAvailabilityData || fetchingCartData || !isVisible()) return undefined

	const singleDatePerOrderMessage = settings.messages.singleDatePerOrderMessage || DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE

	const selectedDay = moment(selectedAvailableDate, SYSTEM_DATE_FORMAT)?.format("dddd")?.toUpperCase() as ConfigDay

	const formAttributeName = isCartPage ? "attributes" : "properties"

	return (
		<div className={classNames("buunto-date-picker", { "buunto-cart-page": isCartPage })} >
			{widgetStyles && <style>{widgetStyles}</style>}
			<div className="buunto-date-picker-label">{settings.messages.datePickerLabel}</div>
			{settings.pickerType == "DROPDOWN" && availableDates.length > 0 && <DropdownDatePicker
                availableDates={availableDates}
                onSelect={handleAvailableDateSelect}
                selectedAvailableDate={selectedAvailableDate}
                settings={settings}
				formError={dateFormError}
				formAttributeName={formAttributeName}
            />}
			{settings.pickerType == "CALENDAR" && availableDates.length > 0 && <CalendarDatePicker
                availableDates={availableDates}
                onSelect={handleAvailableDateSelect}
                settings={settings}
				formError={dateFormError}
                formAttributeName={formAttributeName}
            />}
			{orderDate && <div className="buunto-info-message">{singleDatePerOrderMessage}</div>}
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
