import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopSchema, Shop, ShopApiData, toShop } from "./shop.model"
import { UnexpectedError } from "../util/error"

export class ShopService {
	static async findByDomain(domain: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(`SELECT id, domain, email FROM shops WHERE domain = $1`, [domain])
		return result.rows.map(toShop)[0]
	}

	static async findById(shopId: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(`SELECT id, domain, email FROM shops WHERE id = $1`, [shopId])
		return result.rows.map(toShop)[0]
	}

	static async findAllActiveShops(): Promise<Shop[]> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(`SELECT id, domain, email FROM shops`)
		return result.rows.map(toShop)
	}

	static async createFromApi(shopData: ShopApiData): Promise<Shop | undefined> {
		if (!shopData.domain) throw new UnexpectedError("shopData.domain cannot be undefined")
		if (!shopData.email) throw new UnexpectedError("shopData.email cannot be undefined")
		return await this.insert(new Shop(shopData.domain, shopData.email, shopData))
	}

	static async insert(shop: Shop): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(
			`INSERT INTO shops (domain, email, raw_data) VALUES ($1, $2, $3) RETURNING id, domain, email`,
			[shop.domain, shop.email, shop.rawData]
		)
		return result.rows.map(toShop)[0]
	}
}
