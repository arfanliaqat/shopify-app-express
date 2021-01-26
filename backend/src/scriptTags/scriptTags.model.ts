import { SHOPIFY_APP_URL } from "../../../widget/src/constants"

export interface ScriptTag {
	id?: number
	event: "onload"
	src: string
	display_scope?: "online_store" | "order_status" | "all"
	created_at?: string
	updated_at?: string
}

export function getScriptTagsToCreate(): ScriptTag[] {
	return [
		{
			event: "onload",
			src: `${SHOPIFY_APP_URL}/widget/build/h10-stock-by-date.js`
		}
	]
}
