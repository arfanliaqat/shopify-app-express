import { AvailabilityPeriod } from "./availabilityPeriods.model"
import moment, { Moment } from "moment"
import { ShopResource } from "../shopResource/shopResource.model"
import { AvailabilityPeriodService } from "./availabilityPeriods.service"

export class AvailabilityPeriodBuilder {
	private shopResource?: ShopResource
	private quantity?: number
	private availableDates?: Moment[]
	private quantityIsShared?: boolean

	forShopResource(shopResource: ShopResource): this {
		this.shopResource = shopResource
		return this
	}

	withQuantity(quantity: number): AvailabilityPeriodBuilder {
		this.quantity = quantity
		return this
	}

	withDates(dates: Moment[]): AvailabilityPeriodBuilder {
		this.availableDates = dates
		return this
	}

	withQuantityIsShared(isShared: boolean): AvailabilityPeriodBuilder {
		this.quantityIsShared = isShared
		return this
	}

	async buildAndSave(): Promise<AvailabilityPeriod | undefined> {
		if (!this.shopResource?.id) throw "this.shop is required"

		if (!this.availableDates) {
			this.availableDates = [moment().startOf("day")]
		}

		if (!this.quantity) {
			this.quantity = 10
		}

		if (this.quantityIsShared === undefined) {
			this.quantityIsShared = true
		}

		return await AvailabilityPeriodService.createAvailabilityPeriod(
			this.shopResource.id,
			this.availableDates,
			this.quantity,
			this.quantityIsShared
		)
	}
}
