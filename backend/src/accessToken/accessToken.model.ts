export interface AccessTokenSchema {
	token: string
	shop_id: string
	scopes: string
	created_date: Date
}

export interface AccessToken {
	token: string
	shopId: string
	scopes: string
}

export function hasScope(token: AccessToken, scope: string): boolean {
	return token.scopes.indexOf(scope) >= 0
}

export function toAccessToken(schema: AccessTokenSchema): AccessToken {
	return {
		token: schema.token,
		shopId: schema.shop_id,
		scopes: schema.scopes
	}
}

export interface AccessTokenApiData {
	access_token: string
	scope: string
}
