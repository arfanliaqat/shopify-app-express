export interface AccessTokenSchema {
	token: string
	shop_id: string
	scope: string
	created_date: Date
}

export interface AccessToken {
	token: string
	shopId: string
	scope: string
}

export function toAccessToken(schema: AccessTokenSchema): AccessToken {
	return {
		token: schema.token,
		shopId: schema.shop_id,
		scope: schema.scope
	}
}

export interface AccessTokenApiData {
	access_token: string
	scope: string
}
