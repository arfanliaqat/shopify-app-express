import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopSchema, Shop, ShopApiData, toShop } from "./shop.model"
import { UnexpectedError } from "../util/error"

export class ShopService {
	static async findByDomain(domain: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`SELECT id, domain, public_domain, email, trial_used, uninstalled FROM shops WHERE domain = $1`,
			[domain]
		)
		return result.rows.map(toShop)[0]
	}

	static async findByPublicDomain(domain: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`SELECT id, domain, public_domain, email, trial_used, uninstalled FROM shops WHERE public_domain = $1`,
			[domain]
		)
		return result.rows.map(toShop)[0]
	}

	static async findByShopDomainOrPublicDomain(domain: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		let altDomain: string | undefined
		if ((domain.match(/\./g) || []).length == 1) {
			altDomain = "www." + domain
		}
		if (domain.startsWith("www.")) {
			altDomain = domain.replace(/^www\./, "")
		}
		const result = await conn.query<ShopSchema>(
			`
			SELECT id, domain, public_domain, email, trial_used, uninstalled
			FROM shops
			WHERE (domain = $1 or public_domain in ($2, $3))`,
			[domain, domain, altDomain ?? domain]
		)
		return result.rows.map(toShop)[0]
	}

	static async findById(shopId: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`SELECT id, domain, public_domain, email, trial_used, uninstalled FROM shops WHERE id = $1`,
			[shopId]
		)
		return result.rows.map(toShop)[0]
	}

	static async findAllActiveShops(): Promise<Shop[]> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`SELECT id, domain, public_domain, email, trial_used, uninstalled FROM shops`
		)
		return result.rows.map(toShop)
	}

	static createShopObjectFromApi(shopData: ShopApiData): Shop {
		return new Shop(
			shopData.myshopify_domain || shopData.domain || "",
			shopData.domain || shopData.myshopify_domain || "",
			shopData.email || "",
			undefined,
			undefined,
			shopData
		)
	}

	static async createFromApi(shopData: ShopApiData): Promise<Shop | undefined> {
		if (!shopData.domain) throw new UnexpectedError("shopData.domain cannot be undefined")
		if (!shopData.email) throw new UnexpectedError("shopData.email cannot be undefined")
		const newShop = this.createShopObjectFromApi(shopData)
		return await this.insert(newShop)
	}

	static async updateFromApi(shop: Shop, shopData: ShopApiData): Promise<Shop | undefined> {
		const updatedShop = this.createShopObjectFromApi(shopData)
		updatedShop.id = shop.id
		return await this.update(updatedShop)
	}

	static async insert(shop: Shop): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`
			INSERT INTO shops (domain, public_domain, email, raw_data) VALUES ($1, $2, $3, $4)
			RETURNING id, domain, public_domain, email`,
			[shop.domain, shop.publicDomain, shop.email, shop.rawData]
		)
		return result.rows.map(toShop)[0]
	}

	static async update(shop: Shop): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		await conn.query<ShopSchema>(
			`
			UPDATE shops
			SET domain = $2, public_domain = $3, email = $4, trial_used = $5, uninstalled = $6, raw_data = $7
			WHERE id = $1`,
			[shop.id, shop.domain, shop.publicDomain, shop.email, shop.trialUsed, shop.uninstalled, shop.rawData]
		)
		return shop
	}

	static async markTrialDaysAsUsed(shop: Shop) {
		const conn: Pool = await getConnection()
		await conn.query<ShopSchema>(`UPDATE shops SET trial_used = now() WHERE id = $1`, [shop.id])
	}

	static async markAsUninstalled(shop: Shop) {
		const conn: Pool = await getConnection()
		await conn.query<ShopSchema>(`UPDATE shops SET uninstalled = now() WHERE id = $1`, [shop.id])
	}
}
