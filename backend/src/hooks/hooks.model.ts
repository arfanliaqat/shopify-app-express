export type OrderEventType = "creation" | "update" | "cancellation" | "deletion"

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
