import { safeParseInt } from "./tools"

export const isDev = process.env.NODE_ENV != "production"
export const shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY || ""
export const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || ""
export const scopes = "read_products,read_orders,write_script_tags"
export const appUrl = process.env.SHOPIFY_APP_URL || ""
export const hooksSecret = process.env.HOOKS_SECRET || ""
export const databaseName = process.env.DB_DATABASE || "shopify_app"

export const SYSTEM_DATE_FORMAT = "YYYY-MM-DD"
export const SYSTEM_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss"
export const SHORT_DISPLAY_FORMAT = "ddd D MMM"
export const SHORT_DISPLAY_FORMAT_WITH_YEAR = "ddd D MMM YYYY"
export const TAG_DATE_FORMAT = "DD/MM/YYYY"
export const TAG_LABEL = "Delivery Date"

export type AppName = "DATE_PICKER" | "STOCK_BY_DATE"
export const APP_NAME = (process.env.APP_NAME as AppName) || "STOCK_BY_DATE"

export const allWeekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

export const TRIAL_DAYS = 7

export interface PlanOptions {
	title: string
	price: number
	orderLimit: number
	supportResponseTime: number
}

export const plans: { [key: string]: PlanOptions } = {
	BASIC: {
		title: "Basic",
		price: safeParseInt(process.env.BASIC_PRICE) || 0,
		orderLimit: safeParseInt(process.env.BASIC_ORDER_LIMIT) || 25,
		supportResponseTime: safeParseInt(process.env.PRO_SUPPORT_RESPONSE_TIME) || 48
	},
	PRO: {
		title: "Pro",
		price: safeParseInt(process.env.PRO_PRICE) || 5,
		orderLimit: safeParseInt(process.env.PRO_ORDER_LIMIT) || 150,
		supportResponseTime: safeParseInt(process.env.PRO_SUPPORT_RESPONSE_TIME) || 24
	},
	UNLIMITED: {
		title: "Unlimited",
		price: safeParseInt(process.env.UNLIMITED_PRICE) || 10,
		orderLimit: safeParseInt(process.env.UNLIMITED_ORDER_LIMIT) || -1,
		supportResponseTime: safeParseInt(process.env.PRO_SUPPORT_RESPONSE_TIME) || 12
	}
}

export const isPlanTestMode = process.env.PLAN_TEST_MODE == "true"
