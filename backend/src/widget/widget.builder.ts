import { WidgetSettings } from "./widget.model"
import { WidgetService } from "./widget.service"

export class WidgetSettingsBuilder {
	private readonly shopId?: string
	private firstAvailableDateInDays?: number
	private lastAvailableDateInWeeks?: number

	constructor(shopId: string) {
		this.shopId = shopId
		return this
	}

	withFirstAvailableDateInDays(firstAvailableDateInDays: number): WidgetSettingsBuilder {
		this.firstAvailableDateInDays = firstAvailableDateInDays
		return this
	}

	withLastAvailableDateInWeeks(lastAvailableDateInWeeks: number): WidgetSettingsBuilder {
		this.lastAvailableDateInWeeks = lastAvailableDateInWeeks
		return this
	}

	async buildAndSave(): Promise<WidgetSettings> {
		const widgetSettings = WidgetSettings.getDefault(this.shopId!)
		if (this.firstAvailableDateInDays !== undefined) {
			widgetSettings.settings.firstAvailableDateInDays = this.firstAvailableDateInDays
		}
		if (this.lastAvailableDateInWeeks !== undefined) {
			widgetSettings.settings.lastAvailableDateInWeeks = this.lastAvailableDateInWeeks
		}
		await WidgetService.upsert(widgetSettings)
		return widgetSettings
	}
}
