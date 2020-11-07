import { Pool } from "pg"
import { getConnection } from "../util/database"
import { AccessToken, AccessTokenSchema, toAccessToken } from "./accessToken.model"

export async function findAccessTokenByShopId(shopId: string): Promise<AccessToken> {
	const conn: Pool = await getConnection()
	const result = await conn.query<AccessTokenSchema>(`SELECT * FROM access_tokens WHERE shop_id = $1`, [shopId])
	return result.rows.map(toAccessToken)[0]
}

export async function storeAccessToken(accessToken: AccessToken): Promise<AccessToken> {
	const conn: Pool = await getConnection()
	await conn.query<Partial<AccessTokenSchema>>(`INSERT INTO shops (domain, email, raw_data) VALUES ($1, $2, $3)`, [
		accessToken.token,
		accessToken.shopId,
		accessToken.scope
	])
	return accessToken
}
