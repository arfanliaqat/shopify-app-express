import { Pool } from "pg"
import { Shop } from "../shop/shop.model"
import { getConnection } from "../util/database"
import { ShopResource, ShopResourceSchema, toShopResource } from "./shopResource.model"

export async function findShopResources(shop: Shop): Promise<ShopResource[]> {
	const conn: Pool = await getConnection()
	const result = await conn.query<ShopResourceSchema>(
		`SELECT id, shop_id, resource_type, resource_id, title FROM shop_resources WHERE id = $1`,
		[shop.id]
	)
	return result.rows.map(toShopResource)
}
