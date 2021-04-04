import { AppName } from "../../../backend/src/util/constants"

// Defined with webpack's DefinePlugin
declare const ANCHOR_ID: string
declare const APP_NAME: AppName
export const anchorId = ANCHOR_ID
export const appName = APP_NAME

export const isStockByDateApp = appName == "STOCK_BY_DATE"
