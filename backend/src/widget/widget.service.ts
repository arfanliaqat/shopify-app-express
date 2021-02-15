import { Shop, ShopSchema, toShop } from "../shop/shop.model"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import { WidgetSettings } from "./widget.model"
import { UnexpectedError } from "../util/error"

export class WidgetService {
	static async findById(shopId: string): Promise<Shop | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<ShopSchema>(`SELECT id, domain, email FROM shops WHERE id = $1`, [shopId])
		return result.rows.map(toShop)[0]
	}

	static async findWidgetSettingsByShopId(shopId: string): Promise<WidgetSettingsViewModel | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<{ settings: WidgetSettingsViewModel }>(
			`SELECT settings FROM widget_settings WHERE shop_id = $1`,
			[shopId]
		)
		return result.rows[0]?.settings
	}

	static async findWidgetSettingsByShopDomain(shopDomain: string): Promise<WidgetSettingsViewModel | undefined> {
		const conn: Pool = await getConnection()
		const result = await conn.query<{ settings: WidgetSettingsViewModel }>(
			`SELECT settings FROM shops s JOIN widget_settings ws on s.id = ws.shop_id WHERE s.domain = $1`,
			[shopDomain]
		)
		return result.rows[0]?.settings
	}

	static async findOrCreateWidgetSettings(shopId: string): Promise<WidgetSettingsViewModel> {
		const settings = await this.findWidgetSettingsByShopId(shopId)
		if (settings) return settings
		return this.resetSettingsForShop(shopId)
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

	static async updateForShop(shopId: string, widgetSettings: WidgetSettingsViewModel): Promise<void> {
		const settings = new WidgetSettings(shopId, widgetSettings)
		await this.upsert(settings)
	}

	static async resetSettingsForShop(shopId: string): Promise<WidgetSettingsViewModel> {
		const newSettings = WidgetSettings.getDefault(shopId)
		await this.upsert(newSettings)
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
