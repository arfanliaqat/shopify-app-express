import { h } from "preact"
import { useEffect, useMemo, useState } from "preact/hooks"
import { ANCHOR_ID, SHOPIFY_APP_URL } from "./constants"
import DropdownDatePicker from "./DropdownDatePicker"
import CalendarDatePicker from "./CalendarDatePicker"
import { getCssFromWidgetStyles } from "./util/widgetStyles"
import { ProductAvailabilityData } from "./models/ProductAvailabilityData"

function getDatePickerElement(): HTMLElement {
	const element = document.getElementById(ANCHOR_ID)
	if (!element) {
		throw `[H10 - AvailabilityDatePicker] Please insert the div element with the id ${ANCHOR_ID}`
	}
	return element
}

function getIsPreviewMode() {
	return getDatePickerElement().getAttribute("data-preview") == "true"
}

function getPreviewData(): ProductAvailabilityData {
	return JSON.parse(getDatePickerElement().getAttribute("data-preview-data"))
}

function getProductId() {
	return getDatePickerElement().getAttribute("data-productid")
}

async function fetchAvailabilityForProduct(): Promise<ProductAvailabilityData> {
	const productId = getProductId()
	if (!productId) {
		throw "[H10 - AvailableDatePicker] productId not found"
	}
	const response = await fetch(SHOPIFY_APP_URL + "/product_availability/" + productId, {
		headers: {
			Accept: "application/json"
		}
	})
	if (response.status != 200) {
		throw "[H10 - AvailableDatePicker] failed to fetch product availability"
	}
	return (await response.json()) as ProductAvailabilityData
}

export default function AvailableDatePicker() {
	const [productAvailabilityData, setProductAvailabilityData] = useState<ProductAvailabilityData>(undefined)
	const [selectedAvailableDate, setSelectedAvailableDate] = useState<string>(undefined)
	const [formError, setFormError] = useState<string>(undefined)

	const settings = productAvailabilityData?.settings
	const availableDates = productAvailabilityData?.availableDates || []

	const widgetStyles = useMemo(() => {
		if (settings) {
			return getCssFromWidgetStyles(settings.styles)
		}
	}, [settings])

	const isPreviewMode = getIsPreviewMode()
	useEffect(() => {
		if (isPreviewMode) {
			setProductAvailabilityData(getPreviewData())
		}
	}, [])

	useEffect(() => {
		getDatePickerElement().addEventListener("previewDataUpdated", () => {
			setProductAvailabilityData(getPreviewData())
		}, false);
	}, [])

	useEffect(() => {
		if (!isPreviewMode) {
			async function fetchData() {
				const data = await fetchAvailabilityForProduct()
				setProductAvailabilityData(data)
				const firstAvailableDate = data.availableDates.find(ad => !ad.isSoldOut)
				if (firstAvailableDate) {
					setSelectedAvailableDate(firstAvailableDate.date)
				}
			}
			fetchData()
		}
	}, [])

	useEffect(() => {
		if (!isPreviewMode) {
			const datePickerDiv = document.getElementById(ANCHOR_ID)
			const form = datePickerDiv.closest("form")
			const onSubmit = (e) => {
				if (selectedAvailableDate) return
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
	}, [selectedAvailableDate, settings])

	useEffect(() => {
		if (productAvailabilityData && availableDates.length == 0) {
			setFormError(settings.messages.noAvailableDatesError)
		}
	}, [productAvailabilityData, availableDates, settings])

	const handleAvailableDateSelect = (value: string | undefined) => {
		setSelectedAvailableDate(value)
	}

	if (!productAvailabilityData || !settings) return undefined
	return (
		<div className="h10-date-dropdown-picker">
			{widgetStyles && <style>{widgetStyles}</style>}
			<div className="h10-date-picker-label">{settings.messages.datePickerLabel}</div>
			{formError && <div className="h10-date-picker-error">{formError}</div>}
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
