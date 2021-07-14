import { OrdersPerDate, ProductOrder, ProductOrderSchema } from "./productOrders.model"
import { getConnection, WithTransaction } from "../util/database"
import { ShopResource } from "../shopResource/shopResource.model"
import moment, { Moment } from "moment"
import { Pool } from "pg"
import { handleAxiosErrors, UnexpectedError } from "../util/error"
import {
	DAY_OF_WEEK_TAG_DATE_FORMAT,
	SYSTEM_DATE_FORMAT,
	SYSTEM_DATETIME_FORMAT,
	TAG_DATE_FORMAT
} from "../util/constants"
import { Shop } from "../shop/shop.model"
import { OrderEventData } from "../hooks/hooks.model"
import _ from "lodash"
import { getChosenDate } from "../hooks/hooks.service"
import axios from "axios"
import { AccessTokenService } from "../accessToken/accessToken.service"

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
			SELECT id, shop_resource_id, order_id, chosen_date, quantity, created_date
			FROM product_orders
			WHERE shop_resource_id = $1
			AND chosen_date between $2 and $3`,
			[shopResourceId, fromDate.format(SYSTEM_DATE_FORMAT), toDate.format(SYSTEM_DATE_FORMAT)]
		)
		return result.rows.map(ProductOrder.createFromSchema)
	}

	static sumPerDate(productOrders: ProductOrder[]): OrdersPerDate {
		const sumPerDate = {} as OrdersPerDate
		productOrders.forEach((order) => {
			const strDate = order.chosenDate.format(SYSTEM_DATE_FORMAT)
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
			SELECT id, shop_resource_id, order_id, chosen_date, quantity
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

	static async countOrdersInCurrentMonth(shop: Shop): Promise<number> {
		return await this.countOrdersInMonth(shop, moment())
	}

	static async countOrdersInMonth(shop: Shop, refDate: Moment): Promise<number> {
		const startOfMonth = refDate.clone().startOf("month")
		const endOfMonth = refDate.clone().endOf("month")
		const conn: Pool = await getConnection()
		const result = await conn.query<{ count: string }>(
			`
			SELECT count(distinct po.order_id) as count
			FROM product_orders po
			JOIN shop_resources sr on sr.id = po.shop_resource_id
			WHERE sr.shop_id = $1
			AND po.created_date between $2 and $3`,
			[shop.id, startOfMonth.format(SYSTEM_DATETIME_FORMAT), endOfMonth.format(SYSTEM_DATETIME_FORMAT)]
		)
		return parseInt(result.rows[0].count)
	}

	static getTags(productOrders: ProductOrder[]): string {
		let chosenDates = productOrders.map((productOrder) => productOrder.chosenDate)
		chosenDates = _.uniqBy(chosenDates, (chosenDate) => chosenDate.valueOf())
		chosenDates = _.sortBy(chosenDates, (chosenDate) => chosenDate.valueOf())
		return _.flatten(
			chosenDates.map((chosenDate) => [
				chosenDate.format(TAG_DATE_FORMAT).replace(",", ""),
				chosenDate.format(DAY_OF_WEEK_TAG_DATE_FORMAT)
			])
		).join(",")
	}

	static async updateTags(shop: Shop, orderId: number, tags: string): Promise<void> {
		if (!shop || !shop.id) throw new UnexpectedError("'shop.id' cannot be undefined")
		try {
			const accessToken = await AccessTokenService.findAccessTokenByShopId(shop.id)
			if (!accessToken?.token) {
				return
			}
			const response = await axios.put(
				`https://${shop.domain}/admin/api/2021-04/orders/${orderId}.json`,
				{
					order: {
						id: orderId,
						tags: tags
					}
				},
				{
					headers: {
						"X-Shopify-Access-Token": accessToken.token
					}
				}
			)
			return response.data
		} catch (error) {
			handleAxiosErrors(error)
		}
	}
}

export class ProductOrderServiceWithTransaction extends WithTransaction {
	async findByOrderId(orderId: number) {
		const result = await this.getClient().query<ProductOrderSchema>(
			`
			SELECT id, shop_resource_id, order_id, chosen_date, quantity
			FROM product_orders
			WHERE order_id = $1`,
			[orderId]
		)
		return result.rows.map(ProductOrder.createFromSchema)
	}

	async deleteByOrderId(orderId: number): Promise<void> {
		await this.getClient().query(`DELETE FROM product_orders WHERE order_id = $1`, [orderId])
	}

	async insert(productOrder: ProductOrder): Promise<ProductOrder | undefined> {
		const args = [
			productOrder.shopResourceId,
			productOrder.orderId,
			productOrder.chosenDate.format(SYSTEM_DATE_FORMAT),
			productOrder.quantity
		]
		if (productOrder.createdDate) {
			args.push(productOrder.createdDate.format(SYSTEM_DATETIME_FORMAT))
		}
		const results = await this.getClient().query<{ id: string }>(
			`
			INSERT INTO product_orders (shop_resource_id, order_id, chosen_date, quantity, created_date)
			VALUES ($1, $2, $3, $4, ${productOrder.createdDate ? "$5" : "now()"})
			ON CONFLICT DO NOTHING
			RETURNING id`,
			args
		)
		if (results.rows.length == 1) {
			productOrder.id = results.rows[0].id
		}
		return productOrder
	}

	async refreshTags(shop: Shop, orderEvent: OrderEventData, chosenTimeSlots: Set<string>): Promise<void> {
		const productOrders = await this.findByOrderId(orderEvent.id)
		let tags = ProductOrderService.getTags(productOrders)
		const arrChosenTimeSlots = Array.from(chosenTimeSlots)
		if (arrChosenTimeSlots.length > 0) {
			tags = "," + arrChosenTimeSlots.join(",")
		}
		if (tags != orderEvent.tags) {
			await ProductOrderService.updateTags(shop, orderEvent.id, tags)
		}
	}
}
