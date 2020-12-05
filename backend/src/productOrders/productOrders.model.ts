import moment, { Moment } from "moment"
import { SYSTEM_DATE_FORMAT } from "../util/constants"

export interface ProductOrderSchema {
	id: string
	shop_resource_id: string
	order_id: number
	delivery_date: Date
	quantity: number
	created_date: Date
}

export interface ProductOrderViewModel {
	id: string
	shopResourceId: string
	orderId: number
	deliveryDate: string
	quantity: number
}

export type OrdersPerDate = { [strDate: string]: number }

export class ProductOrder {
	constructor(
		public id: string | undefined,
		public shopResourceId: string,
		public orderId: number,
		public deliveryDate: Moment,
		public quantity: number,
		public createdDate?: Moment
	) {}

	static createFromSchema(schema: ProductOrderSchema): ProductOrder {
		return new ProductOrder(
			schema.id,
			schema.shop_resource_id,
			schema.order_id,
			moment(schema.delivery_date),
			schema.quantity,
			moment(schema.created_date)
		)
	}

	static toViewModel(productOrder: ProductOrder): ProductOrderViewModel {
		return {
			id: productOrder.id!,
			shopResourceId: productOrder.shopResourceId,
			orderId: productOrder.orderId,
			deliveryDate: productOrder.deliveryDate.format(SYSTEM_DATE_FORMAT),
			quantity: productOrder.quantity
		}
	}
}
