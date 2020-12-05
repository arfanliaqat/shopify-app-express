import { ProductOrder } from "./productOrders.model"
import moment, { Moment } from "moment"
import { ShopResource } from "../shopResource/shopResource.model"
import { ProductOrderServiceWithTransaction } from "./productOrders.service"

export class ProductOrderBuilder {
	private shopResource?: ShopResource
	private orderId?: number
	private deliveryDate?: Moment
	private quantity?: number

	forShopResource(shopResource: ShopResource): this {
		this.shopResource = shopResource
		return this
	}

	withOrderId(orderId: number): this {
		this.orderId = orderId
		return this
	}

	withDeliveryDate(deliveryDate: Moment): this {
		this.deliveryDate = deliveryDate
		return this
	}

	withQuantity(quantity: number): this {
		this.quantity = quantity
		return this
	}

	async buildAndSave(): Promise<ProductOrder | undefined> {
		if (!this.shopResource?.id) throw "this.shop is required"

		if (!this.orderId) {
			this.orderId = Math.trunc(Math.random() * 10000)
		}

		if (!this.deliveryDate) {
			this.deliveryDate = moment()
		}

		if (!this.quantity) {
			this.quantity = 1
		}

		const service = new ProductOrderServiceWithTransaction()
		try {
			await service.initClient()
			return await service.insert(
				new ProductOrder(undefined, this.shopResource.id, this.orderId, this.deliveryDate, this.quantity)
			)
		} finally {
			service.releaseClient()
		}
	}
}
