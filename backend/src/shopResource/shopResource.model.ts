export interface ShopResourceSchema {
	id: string
	shop_id: string
	resource_type: string
	resource_id: string
	title: string
	created_date?: Date
}

export interface ShopResource {
	id?: string
	shopId: string
	resourceType: string
	resourceId: string
	title: string
	createdDate?: Date
}

export function toShopResource(schema: ShopResourceSchema): ShopResource {
	return {
		id: schema.id,
		shopId: schema.shop_id,
		resourceType: schema.resource_type,
		resourceId: schema.resource_id,
		title: schema.title,
		createdDate: schema.created_date
	}
}
