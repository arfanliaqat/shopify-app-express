import { OrdersPerDate, ProductOrder, ProductOrderSchema } from "./productOrders.model"
import { getConnection, WithTransaction } from "../util/database"
import { ShopResource } from "../shopResource/shopResource.model"
import { Moment } from "moment"
import { Pool } from "pg"
import { UnexpectedError } from "../util/error"
import { SYSTEM_DATE_FORMAT } from "../util/constants"

export class ProductOrderService {
	static async findByShopResourceAndDate(
		shopResourceId: string,
		fromDate: Moment,
		toDate: Moment
	): Promise<ProductOrder[]> {
		if (fromDate.isAfter(toDate)) {
			throw new UnexpectedError("fromDate cannot be after toDate")
		}
		const conn: Pool = await getConnection()
		const result = await conn.query<ProductOrderSchema>(
			`
			SELECT id, shop_resource_id, order_id, delivery_date, quantity, created_date
			FROM product_orders
			WHERE shop_resource_id = $1
			AND delivery_date between $2 and $3`,
			[shopResourceId, fromDate.format(SYSTEM_DATE_FORMAT), toDate.format(SYSTEM_DATE_FORMAT)]
		)
		return result.rows.map(ProductOrder.createFromSchema)
	}

	static sumPerDate(productOrders: ProductOrder[]): OrdersPerDate {
		const sumPerDate = {} as OrdersPerDate
		productOrders.forEach((order) => {
			const strDate = order.deliveryDate.format(SYSTEM_DATE_FORMAT)
			if (!sumPerDate[strDate]) {
				sumPerDate[strDate] = 0
			}
			sumPerDate[strDate] += order.quantity
		})
		return sumPerDate
	}

	static async findOrdersSummedPerDate(
		shopResourceId: string,
		fromDate: Moment,
		toDate: Moment
	): Promise<OrdersPerDate> {
		const productOrders = await this.findByShopResourceAndDate(shopResourceId, fromDate, toDate)
		return this.sumPerDate(productOrders)
	}

	static async findByShopResource(shopResource: ShopResource) {
		const conn: Pool = await getConnection()
		const result = await conn.query<ProductOrderSchema>(
			`
			SELECT id, shop_resource_id, order_id, delivery_date, quantity
			FROM product_orders
			WHERE shop_resource_id = $1`,
			[shopResource.id]
		)
		return result.rows.map(ProductOrder.createFromSchema)
	}

	static async insert(productOrder: ProductOrder): Promise<ProductOrder | undefined> {
		const serviceWithTransaction = new ProductOrderServiceWithTransaction()
		try {
			await serviceWithTransaction.initClient()
			return await serviceWithTransaction.insert(productOrder)
		} finally {
			serviceWithTransaction.releaseClient()
		}
	}
}

export class ProductOrderServiceWithTransaction extends WithTransaction {
	async deleteByOrderId(orderId: number): Promise<void> {
		await this.getClient().query(`DELETE FROM product_orders WHERE order_id = $1`, [orderId])
	}

	async insert(productOrder: ProductOrder): Promise<ProductOrder | undefined> {
		const results = await this.getClient().query<{ id: string }>(
			`
			INSERT INTO product_orders (shop_resource_id, order_id, delivery_date, quantity)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT DO NOTHING
			RETURNING id`,
			[
				productOrder.shopResourceId,
				productOrder.orderId,
				productOrder.deliveryDate.format(SYSTEM_DATE_FORMAT),
				productOrder.quantity
			]
		)
		if (results.rows.length == 1) {
			productOrder.id = results.rows[0].id
		}
		return productOrder
	}
}
