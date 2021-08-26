import axios from "axios"
import { Shop, ShopApiData } from "../shop/shop.model"
import * as crypto from "crypto"
import { ShopService } from "../shop/shop.service"
import { AccessTokenService } from "../accessToken/accessToken.service"
import { handleAxiosErrors, UnexpectedError } from "../util/error"
import { appUrl, scopes, shopifyApiPublicKey, shopifyApiSecretKey } from "../util/constants"
import { AccessToken } from "../accessToken/accessToken.model"

type FullShopApiData = { shop?: ShopApiData }

export class AuthService {
	static buildRedirectUri(): string {
		return `${appUrl}/auth/callback`
	}

	static buildInstallUrl(shop: string, redirectUri: string): string {
		const baseUrl = `https://${shop}/admin/oauth/authorize`
		const params = `client_id=${shopifyApiPublicKey}&scope=${scopes}&redirect_uri=${redirectUri}`
		return `${baseUrl}?${params}`
	}

	static async fetchShopData(shop: string, accessToken: string): Promise<FullShopApiData | undefined> {
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

	static generateEncryptedHash(params: string): string {
		return crypto.createHmac("sha256", shopifyApiSecretKey).update(params).digest("hex")
	}

	static async installOrReinstallApp(shopDomain: string, code: string, shop?: Shop): Promise<[Shop, AccessToken]> {
		const accessTokenData = await AccessTokenService.fetchAccessToken(shopDomain, code)
		if (accessTokenData) {
			const shopData = await this.fetchShopData(shopDomain, accessTokenData.access_token)
			if (shopData) {
				let dbShop
				if (shopData.shop) {
					dbShop = shop
						? await ShopService.updateFromApi(shop, shopData.shop) // Reinstall
						: await ShopService.createFromApi(shopData.shop) // First install
				}
				if (dbShop && dbShop.id) {
					const accessToken = await AccessTokenService.storeAccessToken({
						token: accessTokenData.access_token,
						scopes: accessTokenData.scope,
						shopId: dbShop.id
					})
					return [dbShop, accessToken]
				}
				throw new UnexpectedError(`Access token could not be found for shop: ${shopDomain}`)
			}
		}
		throw new UnexpectedError(`App couldn't not be installed: ${shopDomain}`)
	}

	static async findShopOrInstallApp(shopDomain: string, code: string): Promise<[Shop, AccessToken]> {
		const dbShop = await ShopService.findByDomain(shopDomain)
		if (dbShop && dbShop.id && !dbShop.uninstalled) {
			const accessTokenData = await AccessTokenService.fetchAccessToken(shopDomain, code)
			if (!accessTokenData) {
				throw new UnexpectedError(`Token couldn't be fetched for shop: ${shopDomain}`)
			}
			const accessToken = await AccessTokenService.storeAccessToken({
				token: accessTokenData.access_token,
				scopes: accessTokenData.scope,
				shopId: dbShop.id
			})
			return [dbShop, accessToken]
		} else {
			return await this.installOrReinstallApp(shopDomain, code, dbShop)
		}
	}
}
