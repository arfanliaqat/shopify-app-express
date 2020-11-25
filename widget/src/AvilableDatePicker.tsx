import { h } from "preact"
import { useEffect } from "preact/hooks"
import { SHOPIFY_APP_URL } from "./constants"

interface ProductAvailabilityData {
	config: any
	availableDates: any[]
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
	useEffect(function () {
		async function fetchData() {
			await fetchAvailabilityForProduct()
		}
		fetchData()
	}, [])

	return <div>TEST</div>
}
