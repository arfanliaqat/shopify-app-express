import { ProductOrder } from "./productOrders.model"
import moment, { Moment } from "moment"
import { ShopResource } from "../shopResource/shopResource.model"
import { ProductOrderService } from "./productOrders.service"

export class ProductOrderBuilder {
	private shopResource?: ShopResource
	private orderId?: number
	private chosenDate?: Moment
	private quantity?: number
	private createdDate?: Moment

	forShopResource(shopResource: ShopResource): this {
		this.shopResource = shopResource
		return this
	}

	withOrderId(orderId: number): this {
		this.orderId = orderId
		return this
	}

	withChosenDate(availableDate: Moment): this {
		this.chosenDate = availableDate
		return this
	}

	withQuantity(quantity: number): this {
		this.quantity = quantity
		return this
	}

	withCreatedDate(createdDate: Moment): this {
		this.createdDate = createdDate
		return this
	}

	async buildAndSave(): Promise<ProductOrder | undefined> {
		if (!this.shopResource?.id) throw "this.shop is required"

		if (!this.orderId) {
			this.orderId = Math.trunc(Math.random() * 10000)
		}

		if (!this.chosenDate) {
			this.chosenDate = moment()
		}

		if (!this.quantity) {
			this.quantity = 1
		}

		return await ProductOrderService.insert(
			new ProductOrder(
				undefined,
				this.shopResource.id,
				this.orderId,
				this.chosenDate,
				this.quantity,
				this.createdDate
			)
		)
	}
}
