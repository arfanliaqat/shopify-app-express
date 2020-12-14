import { SHOPIFY_APP_URL } from "../../../widget/src/constants"

export type OrderEventType =
	| "cancelled"
	| "create"
	| "delete"
	| "edited"
	| "fulfilled"
	| "paid"
	| "partially_fulfilled"
	| "updated"

export interface Property {
	name: string
	value: string
}

export interface LineItem {
	product_id: number
	quantity: number
	properties: Property[]
}

export interface OrderEventData {
	id: number
	line_items: LineItem[]
	cancelled_at?: string | null
}

export interface Webhook {
	id?: number
	address: string
	topic: string
	format: "json"
}

export function getSubscribedHooks(): Webhook[] {
	const allOrderEventTypes: OrderEventType[] = ["cancelled", "create", "delete", "edited", "paid", "updated"]
	return allOrderEventTypes.map((eventType) => ({
		address: `${SHOPIFY_APP_URL}/hooks/orders/${eventType}`,
		topic: `orders/${eventType}`,
		format: "json"
	}))
}
