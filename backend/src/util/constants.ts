import { safeParseInt } from "./tools"
import { WidgetStyles } from "../../../widget/src/models/WidgetSettings"

export const isDev = process.env.NODE_ENV != "production"
export const isChargeTestMode = isDev || (process.env.CHARGE_TEST_MODE || "") === "true"
export const shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY || ""
export const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || ""
export const scopes = "read_products,write_orders,write_script_tags"
export const appUrl = process.env.SHOPIFY_APP_URL || ""
export const hooksSecret = process.env.HOOKS_SECRET || ""
export const databaseName = process.env.DB_DATABASE || "shopify_app"
export const SYSTEM_DATE_FORMAT = "YYYY-MM-DD"
export const SYSTEM_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss"
export const SHORT_DISPLAY_FORMAT = "ddd D MMM"
export const SHORT_DISPLAY_FORMAT_WITH_YEAR = "ddd D MMM YYYY"
export const TAG_DATE_FORMAT = "LL"
export const DAY_OF_WEEK_TAG_DATE_FORMAT = "dddd"
export const DEFAULT_TIME_SLOT_LABEL = "Pick a delivery time:"
export const DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL = "Please select..."
export const DEFAULT_DATE_TAG_LABEL = "Delivery Date"
export const DEFAULT_DAY_OF_WEEK_TAG_LABEL = "Delivery Day"
export const DEFAULT_TIME_SLOT_TAG_LABEL = "Delivery Time"
export const DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE = "You can only choose one delivery date per order."
export const DEFAULT_NO_TIME_SLOT_SELECTED_ERROR = "Please select a time slot before adding to the cart."
export const DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL = "Please select..."

export const defaultWidgetStyles: Partial<WidgetStyles> = {
	errorBorderColor: "#bc6363"
}

export type AppName = "DATE_PICKER" | "STOCK_BY_DATE"
export const APP_NAME = (process.env.APP_NAME as AppName) || "STOCK_BY_DATE"
export const WIDGET_SCRIPT_NAME = process.env.WIDGET_SCRIPT_NAME || "buunto-date-picker.js"

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

export const datePickerLanguages: { value: string; label: string }[] = [
	{ value: "cs", label: "Czech" },
	{ value: "nl", label: "Dutch" },
	{ value: "en", label: "English (United States)" },
	{ value: "en-au", label: "English (Australia)" },
	{ value: "en-ca", label: "English (Canada)" },
	{ value: "en-gb", label: "English (United Kingdom)" },
	{ value: "fr", label: "French" },
	{ value: "fr-ca", label: "French (Canada)" },
	{ value: "de", label: "German" },
	{ value: "id", label: "Indonesian" },
	{ value: "it", label: "Italian" },
	{ value: "pl", label: "Polish" },
	{ value: "pt", label: "Portuguese" },
	{ value: "pt-br", label: "Portuguese (Brazil)" },
	{ value: "ro", label: "Romanian" },
	{ value: "ru", label: "Russian" },
	{ value: "es", label: "Spanish" },
	{ value: "sv", label: "Swedish" }
]
