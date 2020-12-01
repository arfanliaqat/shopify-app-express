import { DeliverySlot } from "./deliverySlots.model"
import moment, { Moment } from "moment"
import { ShopResource } from "../shopResource/shopResource.model"
import { DeliverySlotService } from "./deliverySlots.service"

export class DeliverySlotBuilder {
	private shopResource?: ShopResource
	private quantity?: number
	private dates?: Moment[]

	forShopResource(shopResource: ShopResource): this {
		this.shopResource = shopResource
		return this
	}

	withQuantity(quantity: number): DeliverySlotBuilder {
		this.quantity = quantity
		return this
	}

	withDates(dates: Moment[]): DeliverySlotBuilder {
		this.dates = dates
		return this
	}

	async buildAndSave(): Promise<DeliverySlot | undefined> {
		if (!this.shopResource?.id) throw "this.shop is required"

		if (!this.dates) {
			this.dates = [moment().startOf("day")]
		}

		if (!this.quantity) {
			this.quantity = 10
		}

		return await DeliverySlotService.createDeliverySlot(this.shopResource.id, this.dates, this.quantity)
	}
}
