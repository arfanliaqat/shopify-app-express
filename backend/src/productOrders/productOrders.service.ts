import { ProductOrder, ProductOrderSchema } from "./productOrders.model"
import { getConnection, WithTransaction } from "../util/database"
import { ShopResource, ShopResourceSchema } from "../shopResource/shopResource.model"
import { Moment } from "moment"
import { Pool } from "pg"

export class ProductOrderService {
	static async findByShopResourceAndDate(shopResource: ShopResource, deliveryDate: Moment): Promise<ProductOrder[]> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ProductOrderSchema>(
			`
			SELECT id, shop_resource_id, order_id, delivery_date, quantity
			FROM product_orders
			WHERE shop_resource_id = $1
			AND delivery_date`,
			[shopResource.id]
		)
		return result.rows.map(ProductOrder.createFromSchema)
	}
}

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
