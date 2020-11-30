import { ProductOrder } from "./productOrders.model"
import { WithTransaction } from "../util/database"
import { ShopResourceSchema } from "../shopResource/shopResource.model"

export class ProductOrderServiceWithTransaction extends WithTransaction {
	async deleteByOrderId(orderId: number): Promise<void> {
		await this.getClient().query(`DELETE FROM product_orders WHERE order_id = $1`, [orderId])
	}

	async insert(productOrder: ProductOrder): Promise<void> {
		await this.getClient().query<ShopResourceSchema>(
			`
			INSERT INTO product_orders (shop_resource_id, order_id, delivery_date, quantity)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT DO NOTHING`,
			[productOrder.shopResourceId, productOrder.orderId, productOrder.deliveryDate, productOrder.quantity]
		)
	}
}
