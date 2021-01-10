import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopResourceSchema } from "../shopResource/shopResource.model"
import { CurrentAvailability } from "./currentAvailabilities.model"
import { AvailabilityPeriodService } from "../availabilityPeriods/availabilityPeriods.service"
import { ShopResourceService } from "../shopResource/shopResource.service"
import { Shop } from "../shop/shop.model"

export class CurrentAvailabilityService {
	static async refreshAllShopResources(shop: Shop): Promise<void> {
		const shopResources = await ShopResourceService.findShopResources(shop)
		for (const shopResource of shopResources) {
			if (shopResource.id) {
				await this.refreshCurrentAvailability(shopResource.id)
			}
		}
	}

	static async refreshCurrentAvailability(shopResourceId: string): Promise<CurrentAvailability> {
		const currentAvailability = await this.findNewState(shopResourceId)
		return await this.save(currentAvailability)
	}

	static async findNewState(shopResourceId: string): Promise<CurrentAvailability> {
		const allDates = await AvailabilityPeriodService.findFutureAvailableDates(shopResourceId)
		const availableDates = allDates.filter((d) => !d.isSoldOut)
		const nextAvailabilityDate = availableDates.length > 0 ? availableDates[0].date : undefined
		const lastAvailabilityDate =
			availableDates.length > 0 ? availableDates[availableDates.length - 1].date : undefined
		const nbAvailableDates = availableDates.length
		const nbSoldOutDates = allDates.length - nbAvailableDates
		return new CurrentAvailability(
			undefined,
			shopResourceId,
			nextAvailabilityDate,
			lastAvailabilityDate,
			nbSoldOutDates,
			nbAvailableDates
		)
	}

	static async save(currentAvailability: CurrentAvailability): Promise<CurrentAvailability> {
		const conn: Pool = await getConnection()
		const results = await conn.query<ShopResourceSchema>(
			`
			INSERT INTO current_availabilities (
				shop_resource_id, next_availability_date, last_availability_date, sold_out_dates, available_dates)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (shop_resource_id)
			DO UPDATE SET
				next_availability_date = $2, last_availability_date = $3, sold_out_dates = $4, available_dates = $5
			RETURNING id`,
			[
				currentAvailability.shopResourceId,
				currentAvailability.nextAvailabilityDate,
				currentAvailability.lastAvailabilityDate,
				currentAvailability.soldOutDates,
				currentAvailability.availableDates
			]
		)
		if (results.rows.length == 1) {
			currentAvailability.id = results.rows[0].id
		}
		return currentAvailability
	}
}
