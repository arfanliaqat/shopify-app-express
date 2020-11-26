import moment, { Moment } from "moment"
import { h } from "preact"
import { useEffect, useMemo, useState } from "preact/hooks"
import { SHOPIFY_APP_URL } from "./constants"

interface ProductAvailabilityData {
	config: any
	availableDates: string[]
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

	useEffect(function () {
		async function fetchData() {
			setProductAvailabilityData(await fetchAvailabilityForProduct())
		}
		fetchData()
	}, [])

	const availableDates: Moment[] = useMemo(() => {
		if (!productAvailabilityData) return []
		return productAvailabilityData.availableDates.map((srtDate) => moment(srtDate, "YYYY-MM-DD"))
	}, [productAvailabilityData])

	return (
		<select name="deliveryDate" id="deliveryDate10a">
			{availableDates.map((date) => (
				<option value={date.format("YYYY-MM-DD")}>{date.format("dddd D MMMM")}</option>
			))}
		</select>
	)
}
