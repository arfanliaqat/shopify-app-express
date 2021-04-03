import { AppName } from "../../backend/src/util/constants"

export const STOCK_BY_DATE_ANCHOR_ID = "h10-stock-by-date"
export const DATE_PICKER_ANCHOR_ID = "h10-date-picker"
export const PREVIEW_DATA_UPDATED_EVENT_NAME = "previewDataUpdated"

export function getAnchorElement(): HTMLElement {
	let anchorElement = document.getElementById(STOCK_BY_DATE_ANCHOR_ID)
	if (!anchorElement) {
		anchorElement = document.getElementById(DATE_PICKER_ANCHOR_ID)
	}
	if (!anchorElement) {
		throw `[H10 - AvailabilityDatePicker] Please insert the div element`
	}
	return anchorElement
}

export function getAppName(): AppName {
	return getAnchorElement().id == STOCK_BY_DATE_ANCHOR_ID ? "STOCK_BY_DATE" : "DATE_PICKER"
}

