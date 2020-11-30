export interface LineItem {
	product_id: number
	quantity: number
}

export interface OrderEventData {
	id: number
	line_items: LineItem[]
	tags?: string // e.g. tags: 'Delivery Date: 30/11/2020, Delivery Day: Monday',
}
