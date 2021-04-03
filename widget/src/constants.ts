import { AppName } from "../../backend/src/util/constants"

export const STOCK_BY_DATE_ANCHOR_ID = "h10-stock-by-date"
export const DATE_PICKER_ANCHOR_ID = "h10-date-picker"
export const PREVIEW_DATA_UPDATED_EVENT_NAME = "previewDataUpdated"

export let anchorElement = document.getElementById(STOCK_BY_DATE_ANCHOR_ID)
if (!anchorElement) {
	anchorElement = document.getElementById(DATE_PICKER_ANCHOR_ID)
}

// Defined with webpack's DefinePlugin
declare const SHOPIFY_APP_URL: string
declare const APP_NAME: AppName
export const appName = APP_NAME
export const appUrl = SHOPIFY_APP_URL

