export const isDev = process.env.NODE_ENV != "production"
export const shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY || ""
export const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || ""
export const scopes = "read_products,read_orders,write_script_tags"
export const appUrl = process.env.SHOPIFY_APP_URL || ""
export const hooksSecret = process.env.HOOKS_SECRET || ""
export const databaseName = process.env.DB_DATABASE || "shopify_app"

export const SYSTEM_DATE_FORMAT = "YYYY-MM-DD"
export const SHORT_DISPLAY_FORMAT = "ddd D MMM"
export const SHORT_DISPLAY_FORMAT_WITH_YEAR = "ddd D MMM YYYY"
export const TAG_DATE_FORMAT = "L"
export const TAG_LABEL = "Delivery Date"
