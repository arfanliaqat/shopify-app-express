import { Pool, PoolClient } from "pg"
import { Shop } from "../shop/shop.model"
import { getConnection } from "../util/database"
import { ShopResource, ShopResourceSchema } from "./shopResource.model"
import { parseResourceGid } from "./shopResource.util"
import { BadParameter, handleAxiosErrors, UnexpectedError } from "../util/error"
import { AccessToken } from "../accessToken/accessToken.model"
import Axios from "axios"
import { CurrentAvailabilityService } from "../currentAvailabilities/currentAvailabilities.service"
import { CurrentAvailability } from "../currentAvailabilities/currentAvailabilities.model"

export interface ShopifyResource {
	id: string
	title: string
	featuredImage: {
		originalSrc: string
	} | null
}

type ShopResourceById = { [id: string]: ShopResource }

interface PageResult<A> {
	results: A[]
	hasMore: boolean
}

type AvailabilityStatus = "AVAILABLE" | "SOLD_OUT" | "NOT_AVAILABLE"

interface PageParam {
	search?: string
	status?: AvailabilityStatus
	page?: number
}

export class ShopResourceService {
	static getThumbnailUrlFromOriginalUrl(originalUrl: string | undefined): string | undefined {
		if (!originalUrl) return undefined
		const pos = originalUrl.lastIndexOf(".")
		const head = originalUrl.substring(0, pos)
		const tail = originalUrl.substring(pos)
		return `${head}_medium${tail}`
	}

	static async findShopResourceById(shopResourceId: string): Promise<ShopResource | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopResourceSchema>(
			`
			SELECT id, shop_id, resource_type, resource_id, title, image_url
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

	static async findAllShopResource(shop: Shop): Promise<ShopResource[]> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopResourceSchema>(
			`
			SELECT
				sr.id,
			   	sr.shop_id,
				sr.resource_type,
				sr.resource_id,
				sr.title,
			    sr.image_url
			FROM shop_resources sr
			WHERE sr.shop_id = $1`,
			[shop.id]
		)
		return result.rows.map(ShopResource.createFromSchema)
	}

	static PAGE_SIZE = 50
	static async searchShopResources(shop: Shop, param: PageParam): Promise<PageResult<ShopResource>> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopResourceSchema>(
			`
			SELECT
				sr.id,
			   	sr.shop_id,
				sr.resource_type,
				sr.resource_id,
				sr.title,
			    sr.image_url,
			    ca.next_availability_date,
			    ca.last_availability_date,
			    ca.available_dates,
			    ca.sold_out_dates
			FROM shop_resources sr
			LEFT JOIN current_availabilities ca on sr.id = ca.shop_resource_id
			WHERE sr.shop_id = $1
			ORDER BY ca.next_availability_date IS NOT NULL DESC, lower(sr.title)
			OFFSET $2 LIMIT $3`,
			[shop.id, (param.page || 0) * this.PAGE_SIZE, this.PAGE_SIZE + 1]
		)
		const results = result.rows.map(ShopResource.createFromSchema)
		const hasMore = results.length == this.PAGE_SIZE + 1
		if (hasMore) {
			results.pop()
		}
		return { results, hasMore }
	}

	static async insert(shopResource: ShopResource): Promise<ShopResource | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopResourceSchema>(
			`
			INSERT INTO shop_resources (shop_id, resource_type, resource_id, title, image_url)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT DO NOTHING
			RETURNING id, shop_id, resource_type, resource_id, title, image_url`,
			[
				shopResource.shopId,
				shopResource.resourceType,
				shopResource.resourceId,
				shopResource.title,
				shopResource.imageUrl
			]
		)
		const row = result.rows[0]
		if (!row) return undefined
		const newShopResource = ShopResource.createFromSchema(row)
		if (newShopResource.id) {
			await CurrentAvailabilityService.createInitial(newShopResource.id)
		}
		return newShopResource
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
					query: `
						{
							product(id: "${productGid}") {
								id,
								title,
								featuredImage {
									originalSrc
								}
							}
						}`
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
			let title, imageUrl
			if (resourceId.type == "Product") {
				const shopifyProduct = await this.fetchShopifyProduct(shop, accessToken, resourceGid)
				if (!shopifyProduct) {
					throw new BadParameter(`Shopify product not found: ${resourceGid}`)
				}
				title = shopifyProduct.title
				imageUrl = this.getThumbnailUrlFromOriginalUrl(shopifyProduct.featuredImage?.originalSrc)
			}
			if (!title) {
				throw new BadParameter("`title` should be defined")
			} else {
				if (!shop.id) throw new UnexpectedError("shop.id cannot be undefined")
				const shopResource = ShopResource.create(shop.id, resourceId, title, imageUrl)
				await this.insert(shopResource)
			}
		}
	}
}
