import axios from "axios"
import { Shop, ShopApiData } from "../shop/shop.model"
import * as crypto from "crypto"
import { createShop, findShopByDomain } from "../shop/shop.service"
import { findAccessTokenByShopId, storeAccessToken } from "../accessToken/accessToken.service"
import { handleAxiosErrors } from "../util/error"

const shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY || ""
const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || ""
const scopes = "write_products"
const appUrl = process.env.SHOPIFY_APP_URL

export function buildRedirectUri(): string {
	return `${appUrl}/auth/callback`
}

export function buildInstallUrl(shop: string, state: string, redirectUri: string): string {
	const baseUrl = `https://${shop}/admin/oauth/authorize`
	const params = `client_id=${shopifyApiPublicKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`
	return `${baseUrl}?${params}`
}

interface AccessTokenApiData {
	access_token: string
	scope: string
}

export async function fetchAccessToken(shop: string, code: string): Promise<AccessTokenApiData | undefined> {
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

type FullShopApiData = { shop?: ShopApiData }

export async function fetchShopData(shop: string, accessToken: string): Promise<FullShopApiData | undefined> {
	try {
		return (
			await axios.get<FullShopApiData>(`https://${shop}/admin/shop.json`, {
				headers: {
					"X-Shopify-Access-Token": accessToken
				}
			})
		).data
	} catch (error) {
		handleAxiosErrors(error)
	}
}

export function generateEncryptedHash(params: string): string {
	return crypto.createHmac("sha256", shopifyApiSecretKey).update(params).digest("hex")
}

async function installApp(shopDomain: string, code: string): Promise<Partial<Shop> | undefined> {
	const accessTokenData = await fetchAccessToken(shopDomain, code)
	if (accessTokenData) {
		const shopData = await fetchShopData(shopDomain, accessTokenData.access_token)
		if (shopData) {
			let dbShop
			if (shopData.shop) {
				dbShop = await createShop(shopData.shop)
			}
			if (dbShop && dbShop.id) {
				await storeAccessToken({
					token: accessTokenData.access_token,
					scope: accessTokenData.scope,
					shopId: dbShop.id
				})
			}
			return dbShop
		}
	}
}

export async function findShopOrInstallApp(shopDomain: string, code: string): Promise<Partial<Shop> | undefined> {
	const dbShop = await findShopByDomain(shopDomain)
	if (dbShop && dbShop.id) {
		const accessToken = await findAccessTokenByShopId(dbShop.id)
		if (!accessToken) {
			const accessTokenData = await fetchAccessToken(shopDomain, code)
			if (accessTokenData) {
				await storeAccessToken({
					token: accessTokenData.access_token,
					scope: accessTokenData.scope,
					shopId: dbShop.id
				})
			}
		}
		return dbShop
	}
	return await installApp(shopDomain, code)
}
