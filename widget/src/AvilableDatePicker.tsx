import moment  from "moment"
import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { SHOPIFY_APP_URL } from "./constants"
import { AvailableDate } from "./models/AvailableDate"
import { SYSTEM_DATE_FORMAT, TAG_DATE_FORMAT, TAG_LABEL } from "../../backend/src/util/constants"

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
		throw "[10a - AvailableDatePicker] productId not found"
	}
	const response = await fetch(SHOPIFY_APP_URL + "/product_availability/" + productId, {
		headers: {
			Accept: "application/json"
		}
	})
	if (response.status != 200) {
		throw "[10a - AvailableDatePicker] failed to fetch product availability"
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
		const datePickerDiv = document.getElementById("available-date-picker-10a")
		const form = datePickerDiv.closest("form")
		const onSubmit = (e) => {
			if (e.target.type == "submit") {
				if (!selectedAvailableDate) {
					setFormError("Please select a delivery date before adding to cart")
					e.preventDefault()
					return false
				}
			}
		}
		if (form) {
			form.addEventListener("click", onSubmit)
		}
		return () => {
			form.removeEventListener("click", onSubmit)
		}
	}, [selectedAvailableDate])

	const handleAvailableDateSelect = (e) => {
		if (e.target.value) {
			setSelectedAvailableDate(e.target.value)
		} else {
			setSelectedAvailableDate(undefined)
		}
	}

	return (
		<div>
			{formError && <div style={{ color: "red", marginBottom: "20px", padding: "0 20%", textAlign: "center" }}>{formError}</div>}
			<select name={`properties[${TAG_LABEL}]`} id="availableDate10a" onChange={handleAvailableDateSelect} style={{ width: "100%" }}>
				{availableDates.map((availableDate) => {
					const momentDate = moment(availableDate.date, SYSTEM_DATE_FORMAT)
					const valueDate = momentDate.format(TAG_DATE_FORMAT)
						return (
						<option
							value={valueDate}
							disabled={availableDate.isSoldOut}
							selected={valueDate == selectedAvailableDate}
						>
							{momentDate.format("dddd D MMMM")}
							{availableDate.isSoldOut ? " (sold out)" : ""}
						</option>
					)
				})}
			</select>
		</div>
	)
}
