import moment from "moment"
import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { SHOPIFY_APP_URL } from "./constants"
import { AvailableDate } from "./models/AvailableDate"
import { SYSTEM_DATE_FORMAT, TAG_DATE_FORMAT } from "../../backend/src/util/constants"

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

	useEffect(function () {
		async function fetchData() {
			setProductAvailabilityData(await fetchAvailabilityForProduct())
		}
		fetchData()
	}, [])

	const availableDates = productAvailabilityData?.availableDates || []

	return (
		<select name="properties[Delivery Date]" id="deliveryDate10a">
			{availableDates.map((availableDate) => {
				const momentDate = moment(availableDate.date, SYSTEM_DATE_FORMAT)
				return <option value={momentDate.format(TAG_DATE_FORMAT)} disabled={availableDate.isSoldOut}>
					{momentDate.format("dddd D MMMM")}
					{availableDate.isSoldOut ? " (sold out)" : ""}
				</option>
			})}
		</select>
	)
}
