import { h } from "preact"
import { useCallback, useEffect, useMemo, useState } from "preact/hooks"
import { anchorElement, appName, appUrl } from "./constants"
import DropdownDatePicker from "./DropdownDatePicker"
import CalendarDatePicker from "./CalendarDatePicker"
import { getCssFromWidgetStyles } from "./util/widgetStyles"
import { ProductAvailabilityData } from "./models/ProductAvailabilityData"
import { WidgetSettings } from "./models/WidgetSettings"
import { AvailableDate } from "./models/AvailableDate"
import { getMoment } from "./util/dates"
import { getDaysBetween } from "../../frontend/src/util/tools"
import { SYSTEM_DATE_FORMAT, SYSTEM_DATETIME_FORMAT } from "../../backend/src/util/constants"
import moment from "moment"

function generateAvailableDates(settings: WidgetSettings): AvailableDate[] {
	if (!settings) return []
	const today = getMoment(settings).startOf("day")
	const cutOffTime = moment(moment().format(SYSTEM_DATE_FORMAT) + " " + settings.cutOffTime + ":00", SYSTEM_DATETIME_FORMAT)
	const cutOffExtraDay = moment().isAfter(cutOffTime, "minute") ? 1 : 0
	const firstDay = today.clone().add(settings.firstAvailableDateInDays + cutOffExtraDay, "days")
	const lastDay = today.clone().add(settings.lastAvailableDateInWeeks, "weeks").endOf("weeks")
	const availableWeekDaysSet = new Set(settings.availableWeekDays)
	const disabledDatesSet = new Set(settings.disabledDates)
	return getDaysBetween(firstDay, lastDay, "day")
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
	const response = await fetch(appUrl + "/product_availability/" + productId, {
		headers: {
			Accept: "application/json"
		}
	})
	if (response.status != 200) {
		throw "[Buunto] failed to fetch product availability"
	}
	return (await response.json()) as ProductAvailabilityData
}

async function fetchWidgetSettings(): Promise<WidgetSettings> {
	const response = await fetch(appUrl + "/settings?shop=" + getCurrentDomain(), {
		headers: {
			Accept: "application/json"
		}
	})
	if (response.status == 403) {
		const data = await response.json()
		throw `[Buunto] ${data.reason}`
	}
	if (response.status != 200) {
		throw "[Buunto] failed to fetch widget settings"
	}
	return (await response.json()) as WidgetSettings
}

export default function AvailableDatePicker() {
	const [productAvailabilityData, setProductAvailabilityData] = useState<ProductAvailabilityData>(undefined)
	const [selectedAvailableDate, setSelectedAvailableDate] = useState<string>(undefined)
	const [formError, setFormError] = useState<string>(undefined)

	const settings = productAvailabilityData?.settings
	const availableDates = useMemo(() => appName == "STOCK_BY_DATE"
		? (productAvailabilityData?.availableDates || [])
		: generateAvailableDates(settings), [settings])

	useEffect(() => {
		const firstAvailableDate = availableDates.find(ad => !ad.isSoldOut)
		if (firstAvailableDate) {
			setSelectedAvailableDate(firstAvailableDate.date)
		}
	}, [availableDates])

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
				setFormError(undefined)
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
						availableDates: []
					})
				}

				fetchDatePickerData()
			}

		}
	}, [])

	const isVisible = useCallback(() => {
		return (isPreviewMode || settings?.isVisible) && !isDisabled
	}, [isPreviewMode, settings, isDisabled])

	useEffect(() => {
		if (!isPreviewMode && anchorElement && isVisible()) {
			const form = anchorElement.closest("form")
			const onSubmit = (e) => {
				if (selectedAvailableDate) return
				if (!settings.mandatoryDateSelect) return
				let halt = false
				if (e.target.tagName == "BUTTON" && e.target.type == "submit") {
					halt = true
				} else {
					const button = e.target.closest("button")
					if (button && button.type == "submit") {
						halt = true
					}
				}
				if (halt) {
					setFormError(settings.messages.noDateSelectedError)
					e.preventDefault()
					return false
				}
			}
			if (form) {
				form.addEventListener("click", onSubmit)
			}
			return () => {
				form.removeEventListener("click", onSubmit)
			}
		}
	}, [selectedAvailableDate, settings, isVisible])

	useEffect(() => {
		if (productAvailabilityData && availableDates.length == 0) {
			setFormError(settings.messages.noAvailableDatesError)
		}
	}, [productAvailabilityData, availableDates, settings])

	const handleAvailableDateSelect = (value: string | undefined) => {
		setSelectedAvailableDate(value)
	}

	if (!productAvailabilityData || !isVisible()) return undefined

	return (
		<div className="buunto-date-dropdown-picker">
			{widgetStyles && <style>{widgetStyles}</style>}
			<div className="buunto-date-picker-label">{settings.messages.datePickerLabel}</div>
			{formError && <div className="buunto-date-picker-error">{formError}</div>}
			{settings.pickerType == "DROPDOWN" && availableDates.length > 0 && <DropdownDatePicker
                availableDates={availableDates}
                onSelect={handleAvailableDateSelect}
                selectedAvailableDate={selectedAvailableDate}
                settings={settings}
            />}
			{settings.pickerType == "CALENDAR" && availableDates.length > 0 && <CalendarDatePicker
                availableDates={availableDates}
                onSelect={handleAvailableDateSelect}
                selectedAvailableDate={selectedAvailableDate}
                settings={settings}
            />}
		</div>
	)
}
