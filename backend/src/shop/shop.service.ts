import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopSchema, Shop, ShopApiData, toShop } from "./shop.model"

export async function findShopByDomain(domain: string): Promise<Partial<Shop> | undefined> {
	const conn: Pool = await getConnection()
	const result = await conn.query<Partial<ShopSchema>>(`SELECT id, domain, email FROM shops WHERE domain = $1`, [
		domain
	])
	return result.rows.map(toShop)[0]
}

export async function findShopById(shopId: string): Promise<Partial<Shop> | undefined> {
	const conn: Pool = await getConnection()
	const result = await conn.query<Partial<ShopSchema>>(`SELECT id, domain, email FROM shops WHERE id = $1`, [shopId])
	return result.rows.map(toShop)[0]
}

export async function createShop(shopData: ShopApiData): Promise<Partial<Shop> | undefined> {
	const conn: Pool = await getConnection()
	const result = await conn.query<Partial<ShopSchema>>(
		`INSERT INTO shops (domain, email, raw_data) VALUES ($1, $2, $3) RETURNING id, domain, email`,
		[shopData.domain, shopData.email, JSON.stringify(shopData)]
	)
	return result.rows.map(toShop)[0]
}
