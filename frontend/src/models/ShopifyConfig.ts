import qs from "querystring"
import { shopifyApiPublicKey } from "../common/constants"

interface ShopifyConfig {
	apiKey: string
	shopOrigin: string
	forceRedirect: boolean
}

function getShopOriginFromUrl(): string {
	const search = window.location.search?.startsWith("?") ? window.location.search.substr(1) : window.location.search
	const parsedParams = qs.parse(search)
	return parsedParams.shopOrigin?.toString() || ""
}

export const shopifyConfig: ShopifyConfig = {
	apiKey: shopifyApiPublicKey,
	shopOrigin: getShopOriginFromUrl(),
	forceRedirect: true
}
