import { Shop, ShopSchema, toShop } from "../shop/shop.model"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import { WidgetSettings } from "./widget.model"

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

	static async findOrCreateWidgetSettings(shopId: string): Promise<WidgetSettingsViewModel> {
		const settings = await this.findWidgetSettingsByShopId(shopId)
		if (settings) return settings
		const newSettings = WidgetSettings.getDefault(shopId)
		await this.insert(newSettings)
		return newSettings.settings
	}

	private static async insert(newSettings: WidgetSettings): Promise<void> {
		const conn: Pool = await getConnection()
		await conn.query(
			`
			INSERT INTO widget_settings (shop_id, settings) VALUES ($1, $2)
			ON CONFLICT (shop_id)
			DO UPDATE SET settings = $2, updated_date = now()`,
			[newSettings.shop_id, newSettings.settings]
		)
	}
}
