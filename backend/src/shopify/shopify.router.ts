import { Router } from "express"
import * as crypto from "crypto"
import axios from "axios"
import { Request, Response } from "express"
import querystring from "querystring"

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

async function fetchShopData(shop: string, accessToken: string) {
	return await axios(`https://${shop}/admin/shop.json`, {
		method: "GET",
		headers: {
			"X-Shopify-Access-Token": accessToken
		}
	})
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
	res.cookie("state", nonce, { sameSite: "none" })
	res.redirect(installShopUrl)
})

router.get("/shopify/callback", async (req: Request, res: Response) => {
	const { shop, code, state } = req.query
	if (!shop) return res.status(400).send("Missing 'shop' in the query params")
	if (!state) return res.status(400).send("Missing 'state' in the query params")
	if (!code) return res.status(400).send("Missing 'code' in the query params")

	if (!req.cookies.state) return res.status(400).send("Missing 'state' in the cookie")
	if (state.toString() != req.cookies.state) return res.status(403).send("Cannot be verified")

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
		const tokenResponse = await fetchAccessToken(shop.toString(), data)

		const { access_token } = tokenResponse.data

		const shopData = await fetchShopData(shop.toString(), access_token)

		// TODO: store shop data
		// TODO: Authenticate the shop (create session cookie?)
		// TODO: Redirect to the app

		res.send(shopData.data)
	} catch (err) {
		console.log(err)
		res.status(500).send("something went wrong")
	}
})

export default router
