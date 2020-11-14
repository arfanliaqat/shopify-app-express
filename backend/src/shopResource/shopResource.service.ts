import { Pool } from "pg"
import { Shop } from "../shop/shop.model"
import { getConnection } from "../util/database"
import { ShopResource, ShopResourceSchema, toShopResource } from "./shopResource.model"
import { parseResourceGid } from "./shopResource.util"
import { BadParameter, handleAxiosErrors } from "../util/error"
import { AccessToken } from "../accessToken/accessToken.model"
import Axios from "axios"

export async function findShopResourceById(shopResourceId: string): Promise<ShopResource | undefined> {
	const conn: Pool = await getConnection()
	const result = await conn.query<ShopResourceSchema>(
		`SELECT id, shop_id, resource_type, resource_id, title FROM shop_resources WHERE id = $1`,
		[shopResourceId]
	)
	return result.rows.map(toShopResource)[0]
}

export async function findShopResources(shop: Shop): Promise<ShopResource[]> {
	const conn: Pool = await getConnection()
	const result = await conn.query<ShopResourceSchema>(
		`SELECT id, shop_id, resource_type, resource_id, title FROM shop_resources WHERE shop_id = $1`,
		[shop.id]
	)
	return result.rows.map(toShopResource)
}

export async function createShopResource(shopResource: ShopResource): Promise<void> {
	const conn: Pool = await getConnection()
	await conn.query<ShopResourceSchema>(
		`insert into shop_resources (shop_id, resource_type, resource_id, title) values ($1, $2, $3, $4) on conflict do nothing`,
		[shopResource.shopId, shopResource.resourceType, shopResource.resourceId, shopResource.title]
	)
}

export interface ShopifyResource {
	id: string
	title: string
}

async function fetchShopifyProduct(
	shop: Shop,
	accessToken: AccessToken,
	productGid: string
): Promise<ShopifyResource | undefined> {
	try {
		const response = await Axios({
			method: "POST",
			url: `https://${shop.domain}/admin/api/graphql.json`,
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Access-Token": accessToken.token
			},
			data: {
				query: `{ product(id: "${productGid}") { id, title } }`
			}
		})
		return response.data.data.product as ShopifyResource
	} catch (error) {
		handleAxiosErrors(error)
	}
}

export async function createShopifyResources(
	shop: Shop,
	accessToken: AccessToken,
	resourceGids: string[]
): Promise<void> {
	for (const resourceGid of resourceGids) {
		const resourceId = parseResourceGid(resourceGid)
		if (!resourceId) {
			throw new BadParameter(`'gid' could not be parsed: ${resourceGid}`)
		}
		let title
		if (resourceId.type == "Product") {
			const shopifyProduct = await fetchShopifyProduct(shop, accessToken, resourceGid)
			if (!shopifyProduct) {
				throw new BadParameter(`Shopify product not found: ${resourceGid}`)
			}
			title = shopifyProduct.title
		}
		if (!title) {
			throw new BadParameter("`title` should be defined")
		} else {
			await createShopResource({
				shopId: shop.id,
				resourceId: resourceId.id,
				resourceType: resourceId.type,
				title: title
			})
		}
	}
}