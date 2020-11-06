import { Router } from "express"
import * as crypto from "crypto"
import axios from "axios"
import { Request, Response } from "express"
import querystring from "querystring"
import { getSession, updateSession } from "../util/session"
import { ShopService } from "../shop/shop.service"
import { ShopApiData } from "../shop/shop.model"

const router = Router()

const shopifyApiPublicKey = process.env.SHOPIFY_API_PUBLIC_KEY || ""
const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || ""
const scopes = "write_products"
const appUrl = process.env.SHOPIFY_APP_URL

function buildRedirectUri() {
	return `${appUrl}/shopify/callback`
}

function buildInstallUrl(shop: string, state: string, redirectUri: string) {
	const baseUrl = `https://${shop}/admin/oauth/authorize`
	const params = `client_id=${shopifyApiPublicKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`
	return `${baseUrl}?${params}`
}

function generateEncryptedHash(params: string): string {
	return crypto.createHmac("sha256", shopifyApiSecretKey).update(params).digest("hex")
}

async function fetchAccessToken(shop: string, data: any) {
	return await axios(`https://${shop}/admin/oauth/access_token`, {
		method: "POST",
		data
	})
}

type FullShopApiData = { shop?: ShopApiData }

async function fetchShopData(shop: string, accessToken: string): Promise<FullShopApiData> {
	return (
		await axios.get<FullShopApiData>(`https://${shop}/admin/shop.json`, {
			headers: {
				"X-Shopify-Access-Token": accessToken
			}
		})
	).data
}

function generateNonce(length: number): string {
	let text = ""
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

router.get("/shopify", (req: Request, res: Response) => {
	const shop = req.query.shop
	if (!shop) {
		return res.status(400).send("Shop is missing")
	}
	const nonce = generateNonce(16)
	const installShopUrl = buildInstallUrl(shop.toString(), nonce, buildRedirectUri())
	updateSession(req, res, { state: nonce })
	res.redirect(installShopUrl)
})

router.get("/shopify/callback", async (req: Request, res: Response) => {
	const { shop, code, state } = req.query
	if (!shop) return res.status(400).send("Missing 'shop' in the query params")
	if (!state) return res.status(400).send("Missing 'state' in the query params")
	if (!code) return res.status(400).send("Missing 'code' in the query params")

	const sessionState = getSession(req).state
	if (!sessionState) return res.status(400).send("Missing 'state' in the session")
	if (state.toString() != sessionState) return res.status(403).send("Cannot be verified")

	const { hmac, ...params } = req.query
	const queryParams = querystring.stringify(params as any)
	const hash = generateEncryptedHash(queryParams)

	if (hash !== hmac) {
		return res.status(400).send("HMAC validation failed")
	}

	try {
		const data = {
			client_id: shopifyApiPublicKey,
			client_secret: shopifyApiSecretKey,
			code
		}
		const shopDomain = shop.toString()

		const tokenResponse = await fetchAccessToken(shopDomain, data)
		const { access_token } = tokenResponse.data

		let dbShop = await ShopService.findShopByDomain(shopDomain)
		if (!dbShop) {
			const shopData = await fetchShopData(shopDomain, access_token)
			if (shopData.shop) {
				dbShop = await ShopService.createShop(shopData.shop)
			}
		}

		if (!dbShop || !dbShop.id) {
			throw "Missing 'dbShop' or 'dbShop.id'"
		}

		updateSession(req, res, { shop: dbShop.id, state: undefined })

		res.redirect("/app")
	} catch (err) {
		console.error(err)
		res.status(500).send("something went wrong")
	}
})

export default router
