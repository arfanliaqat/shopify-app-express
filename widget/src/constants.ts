import { AppName } from "../../backend/src/util/constants"

// Defined with webpack's DefinePlugin
declare const ANCHOR_ID: string
declare const APP_NAME: AppName
declare const SHOPIFY_APP_URL: AppName
export const appName = APP_NAME
export const appUrl = SHOPIFY_APP_URL
export const anchorId = ANCHOR_ID
