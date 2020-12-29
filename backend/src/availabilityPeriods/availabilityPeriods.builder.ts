import { AvailabilityPeriod } from "./availabilityPeriods.model"
import moment, { Moment } from "moment"
import { ShopResource } from "../shopResource/shopResource.model"
import { AvailabilityPeriodService } from "./availabilityPeriods.service"

export class AvailabilityPeriodBuilder {
	private shopResource?: ShopResource
	private quantity?: number
	private dates?: Moment[]

	forShopResource(shopResource: ShopResource): this {
		this.shopResource = shopResource
		return this
	}

	withQuantity(quantity: number): AvailabilityPeriodBuilder {
		this.quantity = quantity
		return this
	}

	withDates(dates: Moment[]): AvailabilityPeriodBuilder {
		this.dates = dates
		return this
	}

	async buildAndSave(): Promise<AvailabilityPeriod | undefined> {
		if (!this.shopResource?.id) throw "this.shop is required"

		if (!this.dates) {
			this.dates = [moment().startOf("day")]
		}

		if (!this.quantity) {
			this.quantity = 10
		}

		return await AvailabilityPeriodService.createAvailabilityPeriod(this.shopResource.id, this.dates, this.quantity)
	}
}
