import { Shop } from "../shop/shop.model"
import { AccessToken } from "../accessToken/accessToken.model"
import axios from "axios"
import { handleAxiosErrors } from "../util/error"
import { getScriptTagsToCreate, ScriptTag } from "./scriptTags.model"

export class ScriptTagService {
	static async fetchAllScriptTags(shop: Shop, accessToken: AccessToken): Promise<ScriptTag[] | undefined> {
		try {
			return (
				await axios.get<{ script_tags: ScriptTag[] }>(
					`https://${shop.domain}/admin/api/2021-07/script_tags.json`,
					{
						headers: {
							"X-Shopify-Access-Token": accessToken.token
						}
					}
				)
			).data.script_tags
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async createScriptTag(shop: Shop, accessToken: AccessToken, scriptTag: ScriptTag): Promise<void> {
		try {
			console.log(`[createScriptTag|shop:${shop.domain}] Create ${scriptTag.src}...`)
			return await axios.post(
				`https://${shop.domain}/admin/api/2021-07/script_tags.json`,
				{ script_tag: scriptTag },
				{
					headers: {
						"X-Shopify-Access-Token": accessToken.token
					}
				}
			)
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async deleteScriptTag(shop: Shop, accessToken: AccessToken, scriptTag: ScriptTag): Promise<void> {
		try {
			console.log(`[deleteScriptTag|shop:${shop.domain}] Delete ${scriptTag.src}...`)
			return await axios.delete(`https://${shop.domain}/admin/api/2021-07/script_tags/${scriptTag.id}.json`, {
				headers: {
					"X-Shopify-Access-Token": accessToken.token
				}
			})
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async deleteAllScriptTags(shop: Shop, accessToken: AccessToken): Promise<void> {
		const currentScriptTags = (await this.fetchAllScriptTags(shop, accessToken)) || []
		await currentScriptTags.forEach((scriptTag) => this.deleteScriptTag(shop, accessToken, scriptTag))
	}

	static async createScriptTags(
		shop: Shop,
		accessToken: AccessToken,
		currentScriptTags?: ScriptTag[]
	): Promise<void> {
		console.log(`[createScriptTags|shop:${shop.domain}] Synchronising script tags...`)
		const _currentScriptTags = (currentScriptTags ?? (await this.fetchAllScriptTags(shop, accessToken))) || []
		const allScriptTagsToCreate = getScriptTagsToCreate()
		const scriptTagsToCreate = allScriptTagsToCreate.filter((scriptTag) => {
			return !_currentScriptTags.find((currentScriptTag) => currentScriptTag.src == scriptTag.src)
		})
		const scriptTagsToDelete = _currentScriptTags.filter((currentScriptTag) => {
			return !allScriptTagsToCreate.find((scriptTag) => scriptTag.src == currentScriptTag.src)
		})
		scriptTagsToCreate.map(async (scriptTag) => {
			return this.createScriptTag(shop, accessToken, scriptTag)
		})
		scriptTagsToDelete.map(async (scriptTag) => {
			return this.deleteScriptTag(shop, accessToken, scriptTag)
		})
	}
}
