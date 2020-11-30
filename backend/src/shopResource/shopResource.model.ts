import ShopResourceViewModel from "../../../frontend/src/models/ShopResource"
import { Shop } from "../shop/shop.model"
import { ResourceId } from "./shopResource.util"

export type ResourceType = "Product" | "ProductVariant" | "Collection"

export interface ShopResourceSchema {
	id: string
	shop_id: string
	resource_type: string
	resource_id: number
	title: string
	created_date?: Date
}

export class ShopResource {
	constructor(
		public id: string | undefined,
		public shopId: string,
		public resourceType: ResourceType,
		public resourceId: number,
		public title: string,
		public createdDate?: Date
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
			schema.created_date
		)
	}

	toViewModel(): ShopResourceViewModel {
		return {
			id: this.id || "",
			resourceId: this.resourceId,
			resourceType: this.resourceType,
			title: this.title
		}
	}
}
