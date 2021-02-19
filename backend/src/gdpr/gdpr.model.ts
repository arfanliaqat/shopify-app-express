export enum GdprRequestType {
	CUSTOMER_REDACT = "customers/redact",
	SHOP_REDACT = "shop/redact",
	CUSTOMERS_DATA_REQUEST = "customers/data_request"
}

export class GdprRequest {
	constructor(
		public id: string | undefined,
		public type: GdprRequestType,
		public shopId: string,
		public payload: GdprPayload
	) {}
}

export interface GdprPayload {
	shop_id: string
	shop_domain: string
	customer?: {
		id: number
		email?: string
		phone?: string
	}
	order_to_redact?: number
	data_request?: {
		id: number
	}
	orders_requested?: number[]
}
