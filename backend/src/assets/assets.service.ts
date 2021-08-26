import path from "path"
import { readFile } from "fs/promises"
import { DEFAULT_DATE_TAG_LABEL } from "../util/constants"
import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import { Shop } from "../shop/shop.model"
import { AccessToken, hasScope } from "../accessToken/accessToken.model"
import axios from "axios"
import { handleAxiosErrors } from "../util/error"
import { Theme } from "../themes/themes.model"
import { Asset, PutAssetPayload } from "./assets.model"
import { ThemeService } from "../themes/themes.service"

export class AssetService {
	static async getDatePickerSettingsLiquidTemplate(settings: WidgetSettingsViewModel): Promise<string> {
		const templatePath = path.join(process.cwd(), "backend/src/views/date-picker-settings.liquid")
		return (await readFile(templatePath))
			.toString("utf-8")
			.replace("$$widgetSettings$$", JSON.stringify(settings, null, 2))
			.replace("$$dateTagLabel$$", settings.messages.dateTagLabel ?? DEFAULT_DATE_TAG_LABEL)
	}

	static async updateSettingsLiquidTemplate(
		shop: Shop,
		accessToken: AccessToken,
		settings: WidgetSettingsViewModel
	): Promise<Asset | undefined> {
		const logPrefix = `[updateSettingsLiquidTemplate|shop:${shop.domain}]`
		if (hasScope(accessToken, "write_theme")) {
			const theme = await ThemeService.fetchMainTheme(shop, accessToken)
			if (!theme) {
				console.warn(`${logPrefix} Main theme not found`)
				return
			}
			const templateContent = await AssetService.getDatePickerSettingsLiquidTemplate(settings)
			return await AssetService.putAsset(shop, accessToken, theme, {
				key: "snippets/buunto-date-picker-settings.liquid",
				value: templateContent
			})
		} else {
			console.warn(`${logPrefix} The shop hasn't granted access to alter themes`)
		}
	}

	static async fetchAllAssets(shop: Shop, accessToken: AccessToken, theme: Theme): Promise<Asset[] | undefined> {
		try {
			return (
				await axios.get<{ assets: Asset[] }>(
					`https://${shop.domain}/admin/api/2021-07/themes/${theme.id}/assets.json`,
					{
						headers: {
							"X-Shopify-Access-Token": accessToken.token
						}
					}
				)
			).data.assets
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async putAsset(
		shop: Shop,
		accessToken: AccessToken,
		theme: Theme,
		putAssetPayload: PutAssetPayload
	): Promise<Asset | undefined> {
		try {
			console.log(`[putAsset|shop:${shop.domain}|theme:${theme.id}] Updating ${putAssetPayload.key}...`)
			return (
				await axios.put<{ asset: Asset }>(
					`https://${shop.domain}/admin/api/2021-07/themes/${theme.id}/assets.json`,
					{ asset: putAssetPayload },
					{
						headers: {
							"X-Shopify-Access-Token": accessToken.token
						}
					}
				)
			).data.asset
		} catch (error) {
			handleAxiosErrors(error)
		}
	}
}
