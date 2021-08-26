import { Shop } from "../shop/shop.model"
import { AccessToken } from "../accessToken/accessToken.model"
import axios from "axios"
import { handleAxiosErrors } from "../util/error"
import { Theme } from "./themes.model"

export class ThemeService {
	static async fetchAllThemes(shop: Shop, accessToken: AccessToken): Promise<Theme[] | undefined> {
		try {
			const result = await axios.get<{ themes: Theme[] }>(
				`https://${shop.domain}/admin/api/2021-07/themes.json`,
				{
					headers: {
						"X-Shopify-Access-Token": accessToken.token
					}
				}
			)
			return result.data.themes
		} catch (error) {
			handleAxiosErrors(error)
		}
	}
	static async fetchMainTheme(shop: Shop, accessToken: AccessToken): Promise<Theme | undefined> {
		const themes = await this.fetchAllThemes(shop, accessToken)
		return (themes || []).find((theme) => theme.role == "main")
	}
}
