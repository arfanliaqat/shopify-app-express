import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopSchema, Shop, ShopApiData, toShop } from "./shop.model"

export class ShopService {
	static async findShopByDomain(domain: string): Promise<Partial<Shop> | undefined> {
		const conn: Pool = await getConnection()

		const result = await conn.query<Partial<ShopSchema>>({
			name: "find-shop-by-domain",
			text: `SELECT id, domain, email FROM shops WHERE domain = $1`,
			values: [domain]
		})

		return result.rows.map(toShop)[0]
	}

	static async createShop(shopData: ShopApiData): Promise<Partial<Shop> | undefined> {
		const conn: Pool = await getConnection()

		const result = await conn.query<Partial<ShopSchema>>({
			name: "create-shop",
			text: `
				INSERT INTO shops (domain, email, raw_data)
				VALUES ($1, $2, $3)
				RETURNING id, domain, email`,
			values: [shopData.domain, shopData.email, JSON.stringify(shopData)]
		})
		return result.rows.map(toShop)[0]
	}
}
