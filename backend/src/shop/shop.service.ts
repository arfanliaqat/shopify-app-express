import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopSchema, Shop, ShopApiData, toShop } from "./shop.model"
import { UnexpectedError } from "../util/error"

export class ShopService {
	static async findByDomain(domain: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`SELECT id, domain, public_domain, email, trial_used FROM shops WHERE domain = $1`,
			[domain]
		)
		return result.rows.map(toShop)[0]
	}

	static async findByPublicDomain(domain: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`SELECT id, domain, public_domain, email, trial_used FROM shops WHERE public_domain = $1`,
			[domain]
		)
		return result.rows.map(toShop)[0]
	}

	static async findById(shopId: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`SELECT id, domain, public_domain, email, trial_used FROM shops WHERE id = $1`,
			[shopId]
		)
		return result.rows.map(toShop)[0]
	}

	static async findAllActiveShops(): Promise<Shop[]> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(`SELECT id, domain, public_domain, email, trial_used FROM shops`)
		return result.rows.map(toShop)
	}

	static async createFromApi(shopData: ShopApiData): Promise<Shop | undefined> {
		if (!shopData.domain) throw new UnexpectedError("shopData.domain cannot be undefined")
		if (!shopData.email) throw new UnexpectedError("shopData.email cannot be undefined")
		return await this.insert(
			new Shop(
				shopData.myshopify_domain || shopData.domain || "",
				shopData.domain || shopData.myshopify_domain || "",
				shopData.email,
				undefined,
				shopData
			)
		)
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

	static async markTrialDaysAsUsed(shop: Shop) {
		const conn: Pool = await getConnection()
		await conn.query<ShopSchema>(`UPDATE shops SET trial_used = now() WHERE id = $1`, [shop.id])
	}
}
