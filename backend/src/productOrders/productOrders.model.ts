import moment, { Moment } from "moment"

export interface ProductOrderSchema {
	id: number
	shop_resource_id: string
	order_id: number
	delivery_date: Date
	quantity: number
	update_date: Date
	created_date: Date
}

export class ProductOrder {
	constructor(
		public shopResourceId: string,
		public orderId: number,
		public deliveryDate: Moment,
		public quantity: number,
		public updateDate?: Moment,
		public createdDate?: Moment,
		public id?: number
	) {}

	static createFromSchema(schema: ProductOrderSchema): ProductOrder {
		return new ProductOrder(
			schema.shop_resource_id,
			schema.order_id,
			moment(schema.delivery_date),
			schema.quantity,
			moment(schema.update_date),
			moment(schema.created_date),
			schema.id
		)
	}
}
