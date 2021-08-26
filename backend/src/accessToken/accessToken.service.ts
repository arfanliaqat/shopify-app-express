import { Pool } from "pg"
import { getConnection } from "../util/database"
import { AccessToken, AccessTokenApiData, AccessTokenSchema, toAccessToken } from "./accessToken.model"
import axios from "axios"
import { shopifyApiPublicKey, shopifyApiSecretKey } from "../util/constants"
import { handleAxiosErrors } from "../util/error"

export class AccessTokenService {
	static async fetchAccessToken(shop: string, code: string): Promise<AccessTokenApiData | undefined> {
		try {
			const response = await axios.post<AccessTokenApiData>(`https://${shop}/admin/oauth/access_token`, {
				client_id: shopifyApiPublicKey,
				client_secret: shopifyApiSecretKey,
				code
			})
			return response.data
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async findAccessTokenByShopId(shopId: string): Promise<AccessToken> {
		const conn: Pool = await getConnection()
		const result = await conn.query<AccessTokenSchema>(`SELECT * FROM access_tokens WHERE shop_id = $1`, [shopId])
		return result.rows.map(toAccessToken)[0]
	}

	static async storeAccessToken(accessToken: AccessToken): Promise<AccessToken> {
		const conn: Pool = await getConnection()
		await conn.query<Partial<AccessTokenSchema>>(
			`
			INSERT INTO access_tokens (token, shop_id, scopes)
			VALUES ($1, $2, $3)
			ON CONFLICT (shop_id) DO UPDATE SET token = $1, scopes = $3`,
			[accessToken.token, accessToken.shopId, accessToken.scopes]
		)
		return accessToken
	}
}
