import ShopResourceViewModel from "../../../frontend/src/models/ShopResource"
import { Shop } from "../shop/shop.model"
import { ResourceId } from "./shopResource.util"
import { SYSTEM_DATE_FORMAT } from "../util/constants"
import moment, { Moment } from "moment"

export type ResourceType = "Product" | "ProductVariant" | "Collection"

export interface ShopResourceSchema {
	id: string
	shop_id: string
	resource_type: string
	resource_id: number
	title: string
	created_date?: Date
	next_availability_date?: Date
	last_availability_date?: Date
	available_dates?: number
	sold_out_dates?: number
}

export class ShopResource {
	constructor(
		public id: string | undefined,
		public shopId: string,
		public resourceType: ResourceType,
		public resourceId: number,
		public title: string,
		public createdDate?: Date,
		public nextAvailabilityDate?: Moment,
		public lastAvailabilityDate?: Moment,
		public availableDates?: number,
		public soldOutDates?: number
	) {}

	belongsTo(connectedShop: Shop): boolean {
		return !!connectedShop?.id && !!this.shopId && connectedShop?.id == this.shopId
	}

	static create(shopId: string, resourceId: ResourceId, title: string): ShopResource {
		return new ShopResource(undefined, shopId, resourceId.type, resourceId.id, title)
	}

	static createFromSchema(schema: ShopResourceSchema): ShopResource {
		return new ShopResource(
			schema.id,
			schema.shop_id,
			schema.resource_type as ResourceType,
			schema.resource_id,
			schema.title,
			schema.created_date,
			moment(schema.next_availability_date),
			moment(schema.last_availability_date),
			schema.available_dates,
			schema.sold_out_dates
		)
	}

	toViewModel(): ShopResourceViewModel {
		return {
			id: this.id || "",
			resourceId: this.resourceId,
			resourceType: this.resourceType,
			title: this.title,
			nextAvailabilityDate: this.nextAvailabilityDate?.format(SYSTEM_DATE_FORMAT),
			lastAvailabilityDate: this.lastAvailabilityDate?.format(SYSTEM_DATE_FORMAT),
			availableDates: this.availableDates,
			soldOutDates: this.soldOutDates
		}
	}
}
