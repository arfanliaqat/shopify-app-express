import { appUrl } from "../util/constants"

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
	tags?: string
	node_attributes?: Property[]
}

export interface Webhook {
	id?: number
	address: string
	topic: string
	format: "json"
}

export function getSubscribedHooks(): Webhook[] {
	const allOrderEventTypes: OrderEventType[] = ["create"]
	const hooks: Webhook[] = allOrderEventTypes.map((eventType) => ({
		address: `${appUrl}/hooks/orders/${eventType}`,
		topic: `orders/${eventType}`,
		format: "json"
	}))
	hooks.push({
		address: `${appUrl}/hooks/app/uninstalled`,
		topic: "app/uninstalled",
		format: "json"
	})
	return hooks
}
