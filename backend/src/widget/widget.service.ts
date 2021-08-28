import { Shop } from "../shop/shop.model"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import { WidgetSettings } from "./widget.model"
import { UnexpectedError } from "../util/error"
import { AssetService } from "../assets/assets.service"
import { AccessToken } from "../accessToken/accessToken.model"
import { AccessTokenService } from "../accessToken/accessToken.service"

export class WidgetService {
	static async findWidgetSettingsByShopId(shopId: string): Promise<WidgetSettingsViewModel | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<{ settings: WidgetSettingsViewModel }>(
			`SELECT settings FROM widget_settings WHERE shop_id = $1`,
			[shopId]
		)
		return result.rows[0]?.settings
	}

	static async findOrCreateWidgetSettings(shop: Shop): Promise<WidgetSettingsViewModel> {
		if (!shop.id) throw new UnexpectedError("Shop id cannot be null")
		const settings = await this.findWidgetSettingsByShopId(shop.id)
		if (settings) return settings
		return this.resetSettingsForShop(shop)
	}

	static async upsert(newSettings: WidgetSettings): Promise<void> {
		const conn: Pool = await getConnection()
		await conn.query(
			`
			INSERT INTO widget_settings (shop_id, settings) VALUES ($1, $2)
			ON CONFLICT (shop_id)
			DO UPDATE SET settings = $2, updated_date = now()`,
			[newSettings.shop_id, newSettings.settings]
		)
	}

	static async updateForShop(shop: Shop, widgetSettings: WidgetSettingsViewModel): Promise<void> {
		if (!shop.id) throw new UnexpectedError("Shop id cannot be null")
		const settings = new WidgetSettings(shop.id, widgetSettings)
		await this.upsert(settings)
		await AssetService.updateSettingsLiquidTemplate(shop, widgetSettings)
	}

	static async resetSettingsForShop(shop: Shop): Promise<WidgetSettingsViewModel> {
		if (!shop.id) throw new UnexpectedError("Shop id cannot be null")
		const newSettings = WidgetSettings.getDefault(shop.id)
		await this.upsert(newSettings)
		await AssetService.updateSettingsLiquidTemplate(shop, newSettings.settings)
		return newSettings.settings
	}

	static async findWidgetSettingsByShop(shop: Shop): Promise<WidgetSettingsViewModel> {
		if (!shop.id) {
			throw new UnexpectedError("Shop id cannot be null")
		}
		const widgetSettings = await this.findWidgetSettingsByShopId(shop.id)
		if (!widgetSettings) {
			throw new UnexpectedError("Widget settings not found")
		}
		return widgetSettings
	}
}
