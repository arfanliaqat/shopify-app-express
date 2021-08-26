import { WidgetSettings } from "../models/WidgetSettings"
import axios from "axios"
import { appUrl } from "../constants"
import { getThemeConfig } from "../models/ThemeConfig"

function getCurrentDomain() {
	const shopDomain: string | undefined = ((window as any).Shopify?.shop) as string
	if (shopDomain) {
		return shopDomain
	} else {
		let url = window.location.href
		const start = url.indexOf("://") + 3
		url = url.substring(start)
		const end = url.indexOf("/")
		return url.substring(0, end)
	}
}

function toQueryString(parameters: { [key: string]: string }): string {
	return Object.entries(parameters).map(([key, value]) => key + "=" + value).join("&")
}

export async function fetchWidgetSettings(productVariantId?: number): Promise<WidgetSettings> {
	const widgetSettings = getThemeConfig()?.datePicker?.settings
	if (widgetSettings) {
		return widgetSettings
	}
	const parameters = {} as { [key: string]: string }
	parameters["shop"] = getCurrentDomain()
	if (productVariantId) parameters["productVariantId"] = productVariantId + ""
	parameters["_ts"] = Date.now() + ""
	const response = await axios.get(appUrl + "/settings?" + toQueryString(parameters), {
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


export async function fetchDatePickerVisibility(productVariantIds: number[]): Promise<boolean> {
	const params = {
		shop: getCurrentDomain(),
		productVariantIds: productVariantIds.join(","),
		_ts: Date.now() + ""
	} as { [key: string]: string }
	const response = await axios.get(appUrl + "/date_picker_visibility?" + toQueryString(params), {
		headers: {
			Accept: "application/json"
		}
	})
	const { isVisible } = await response.data as any
	return isVisible as boolean
}

export async function fetchCartData(): Promise<any> {
	const response = await axios.get("/cart.js", {
		headers: {
			Accept: "application/json"
		}
	})
	return await response.data as any
}
