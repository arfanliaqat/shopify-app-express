
import { WidgetSettings } from "../models/WidgetSettings"
import axios from "axios"
import { appUrl } from "../constants"

function getCurrentDomain() {
	let url = window.location.href
	const start = url.indexOf("://") + 3
	url = url.substring(start)
	const end = url.indexOf("/")
	return url.substring(0, end)
}

export async function fetchWidgetSettings(): Promise<WidgetSettings> {
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
