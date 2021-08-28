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
import { ShopPlanService } from "../shopPlan/shopPlan.service"
import { AccessTokenService } from "../accessToken/accessToken.service"
import { WidgetService } from "../widget/widget.service"

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
		settings?: WidgetSettingsViewModel
	): Promise<Asset | undefined> {
		const logPrefix = `[updateSettingsLiquidTemplate|shop:${shop.domain}]`
		const accessToken = shop.id ? await AccessTokenService.findAccessTokenByShopId(shop.id) : undefined
		if (!accessToken || !hasScope(accessToken, "write_theme")) {
			console.warn(`${logPrefix} The shop hasn't granted access to alter themes`)
			return
		}
		if (!settings && shop?.id) {
			settings = await WidgetService.findWidgetSettingsByShopId(shop.id)
		}
		if (!settings) {
			console.warn(`${logPrefix} Settings not found`)
			return
		}
		const theme = await ThemeService.fetchMainTheme(shop, accessToken)
		if (!theme) {
			console.warn(`${logPrefix} Main theme not found`)
			return
		}
		if (settings.isVisible) {
			settings.isVisible = await ShopPlanService.hasActivePlan(shop)
		}
		const templateContent = await AssetService.getDatePickerSettingsLiquidTemplate(settings)
		return await AssetService.putAsset(shop, accessToken, theme, {
			key: "snippets/buunto-date-picker-settings.liquid",
			value: templateContent
		})
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
