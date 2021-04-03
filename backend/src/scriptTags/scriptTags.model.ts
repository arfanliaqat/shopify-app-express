import { appUrl, WIDGET_SCRIPT_NAME } from "../util/constants"

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
			src: `${appUrl}/widget/build/${WIDGET_SCRIPT_NAME}`
		}
	]
}
