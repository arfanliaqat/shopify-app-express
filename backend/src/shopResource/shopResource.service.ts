import { Pool } from "pg"
import { Shop } from "../shop/shop.model"
import { getConnection } from "../util/database"
import { ShopResource, ShopResourceSchema, toShopResource } from "./shopResource.model"
import { parseResourceGid } from "./shopResource.util"
import axios from "axios"

export async function findShopResources(shop: Shop): Promise<ShopResource[]> {
	const conn: Pool = await getConnection()
	const result = await conn.query<ShopResourceSchema>(
		`SELECT id, shop_id, resource_type, resource_id, title FROM shop_resources WHERE id = $1`,
		[shop.id]
	)
	return result.rows.map(toShopResource)
}

export interface ShopifyResource {
	id: string
	title: string
}

async function fetchShopifyProduct(shop: Shop, gid: string): Promise<ShopifyResource | undefined> {
	const accessToken = "" // get from connected shop object
	const result = await axios.post(`https://${shop.domain}/admin/api/2020-10/graphql.json`, {
		headers: {
			"X-Shopify-Access-Token": accessToken
		},
		data: {
			query: `{ product(id: "${gid}") { id, title } }`
		}
	})
	const productNode = result.data.body.data.product
	return {
		id: productNode.id,
		title: productNode.title
	}
}

export async function fetchShopifyResources(shop: Shop, resourceGids: string[]): Promise<ShopifyResource[]> {
	return Promise.all(
		resourceGids
			.map(async (resourceGid) => {
				const resourceId = parseResourceGid(resourceGid)
				if (!resourceId) {
					console.error("'gid' could not be parsed: " + resourceGid)
					return
				}
				switch (resourceId.type) {
					case "Product":
						const shopifyProduct = await fetchShopifyProduct(shop, resourceGid)
						if (!shopifyProduct) {
							console.error("Shopify product not found: " + resourceGid)
						}
						return shopifyProduct
					default:
						console.error("Unsupported resource type: " + resourceId.type)
				}
			})
			.filter((shopifyResource) => shopifyResource !== undefined) as Promise<ShopifyResource>[]
	)
}
