import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { ANCHOR_ID, SHOPIFY_APP_URL } from "./constants"
import { AvailableDate } from "./models/AvailableDate"
import DropdownDatePicker from "./DropdownDatePicker"
import { JSXInternal } from "preact/src/jsx"
import CSSProperties = JSXInternal.CSSProperties

interface ProductAvailabilityData {
	config: any
	availableDates: AvailableDate[]
}

function getProductId() {
	const datePickerDiv = document.getElementById("available-date-picker-10a")
	if (!datePickerDiv) return undefined
	return datePickerDiv?.getAttribute("data-productid")
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

	useEffect(() => {
		async function fetchData() {
			const data = await fetchAvailabilityForProduct()
			setProductAvailabilityData(data)
			const firstAvailableDate = data.availableDates.find(ad => !ad.isSoldOut)
			if (firstAvailableDate) {
				setSelectedAvailableDate(firstAvailableDate.date)
			}
		}

		fetchData()
	}, [])

	const availableDates = productAvailabilityData?.availableDates || []

	useEffect(() => {
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
				setFormError("Please select a delivery date before adding to cart.")
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
	}, [selectedAvailableDate])

	useEffect(() => {
		if (productAvailabilityData && availableDates.length == 0) {
			setFormError("There are currently no dates available for this product.")
		}
	}, [productAvailabilityData, availableDates])

	const handleAvailableDateSelect = (value: string | undefined) => {
		setSelectedAvailableDate(value)
	}

	const formErrorStyles: CSSProperties = {
		color: "darkred",
		marginBottom: "20px"
	}

	return (
		<div className="h10-date-picker">
			<div className="h10-date-picker-label">Pick a delivery date:</div>
			{formError && <div className="h10-date-picker-error" style={formErrorStyles}>{formError}</div>}
			{availableDates.length > 0 && <DropdownDatePicker
                availableDates={availableDates}
                onSelect={handleAvailableDateSelect}
                selectedAvailableDate={selectedAvailableDate}
            />}
		</div>
	)
}
