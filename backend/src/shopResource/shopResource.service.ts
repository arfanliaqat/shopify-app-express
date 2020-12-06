import { Pool, PoolClient } from "pg"
import { Shop } from "../shop/shop.model"
import { getConnection } from "../util/database"
import { ShopResource, ShopResourceSchema } from "./shopResource.model"
import { parseResourceGid } from "./shopResource.util"
import { BadParameter, handleAxiosErrors, UnexpectedError } from "../util/error"
import { AccessToken } from "../accessToken/accessToken.model"
import Axios from "axios"

export interface ShopifyResource {
	id: string
	title: string
}

type ShopResourceById = { [id: string]: ShopResource }

export class ShopResourceService {
	static async findShopResourceById(shopResourceId: string): Promise<ShopResource | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopResourceSchema>(
			`
			SELECT id, shop_id, resource_type, resource_id, title
			FROM shop_resources
			WHERE id = $1`,
			[shopResourceId]
		)
		const row = result.rows[0]
		if (!row) return undefined
		return ShopResource.createFromSchema(row)
	}

	static async findShopResourceIdByProductId(productId: number): Promise<string | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<{ id: string }>(
			`
			SELECT id
			FROM shop_resources
			WHERE resource_type = 'Product'
			AND resource_id = $1`,
			[productId]
		)
		return result.rows[0]?.id
	}

	static async findByProductIds(productIds: number[], client: PoolClient): Promise<ShopResource[]> {
		if (productIds.length == 0) return []
		const result = await client.query<ShopResourceSchema>(
			`
			SELECT id, shop_id, resource_type, resource_id, title
			FROM shop_resources
			WHERE resource_type = 'Product'
			AND resource_id in (${productIds.join(",")})`
		)
		return result.rows.map(ShopResource.createFromSchema)
	}

	static groupByResourceId(shopResources: ShopResource[]): ShopResourceById {
		return shopResources.reduce((acc, sr) => {
			acc[sr.resourceId] = sr
			return acc
		}, {} as ShopResourceById)
	}

	static async findShopResources(shop: Shop): Promise<ShopResource[]> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopResourceSchema>(
			`
			SELECT id, shop_id, resource_type, resource_id, title
			FROM shop_resources
			WHERE shop_id = $1`,
			[shop.id]
		)
		return result.rows.map(ShopResource.createFromSchema)
	}

	static async insert(shopResource: ShopResource): Promise<ShopResource | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopResourceSchema>(
			`
			INSERT INTO shop_resources (shop_id, resource_type, resource_id, title)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT DO NOTHING
			RETURNING id, shop_id, resource_type, resource_id, title`,
			[shopResource.shopId, shopResource.resourceType, shopResource.resourceId, shopResource.title]
		)
		const row = result.rows[0]
		if (!row) return undefined
		return ShopResource.createFromSchema(row)
	}

	static async fetchShopifyProduct(
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

	static async createShopifyResources(shop: Shop, accessToken: AccessToken, resourceGids: string[]): Promise<void> {
		for (const resourceGid of resourceGids) {
			const resourceId = parseResourceGid(resourceGid)
			if (!resourceId) {
				throw new BadParameter(`'gid' could not be parsed: ${resourceGid}`)
			}
			let title
			if (resourceId.type == "Product") {
				const shopifyProduct = await this.fetchShopifyProduct(shop, accessToken, resourceGid)
				if (!shopifyProduct) {
					throw new BadParameter(`Shopify product not found: ${resourceGid}`)
				}
				title = shopifyProduct.title
			}
			if (!title) {
				throw new BadParameter("`title` should be defined")
			} else {
				if (!shop.id) throw new UnexpectedError("shop.id cannot be undefined")
				const shopResource = ShopResource.create(shop.id, resourceId, title)
				await this.insert(shopResource)
			}
		}
	}
}
