import { ResourceType, ShopResource } from "./shopResource.model"
import { ShopResourceService } from "./shopResource.service"
import { Shop } from "../shop/shop.model"

export class ShopResourceBuilder {
	private shop?: Shop
	private resourceType?: ResourceType
	private resourceId?: number
	private title?: string

	forShop(shop: Shop): this {
		this.shop = shop
		return this
	}

	withResourceId(resourceType: ResourceType, resourceId: number): this {
		this.resourceType = resourceType
		this.resourceId = resourceId
		return this
	}

	withTitle(title: string): this {
		this.title = title
		return this
	}

	async buildAndSave(): Promise<ShopResource | undefined> {
		if (!this.shop?.id) throw "this.shop is required"
		const newShopResource = new ShopResource(
			undefined,
			this.shop.id,
			this.resourceType || "Product",
			this.resourceId || 1,
			this.title || "My product title"
		)
		return await ShopResourceService.insert(newShopResource)
	}
}
