import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"

export interface WidgetSettingsSchema {
	shop_id: string
	settings: string
	updated_date: Date
	created_date: Date
}

export class WidgetSettings {
	constructor(public shop_id: string, public settings: WidgetSettingsViewModel) {}

	static getDefault(shopId: string): WidgetSettings {
		return new WidgetSettings(shopId, {
			pickerType: "CALENDAR",
			locale: "en",
			styles: {
				errorFontColor: "#8B0000",
				calendarBoxShadow: "0 0 5px rgba(0,0,0,0.15)",
				calendarBorderRadius: "10px",
				calendarBackgroundColor: "#FFFFFF",
				headerFontColor: "#333333",
				arrowIconColor: "#000000",
				headerDaysFontColor: "#333333",
				dayUnavailableFontColor: "#AAAAAA",
				dayAvailableFontColor: "#333333",
				dayHoveringBackgroundColor: "#EEEEEE",
				dayHoveringFontColor: "#333333",
				daySelectedBackgroundColor: "#333333",
				daySelectedFontColor: "#FFFFFF",
				previewBackgroundColor: "#FFFFFF"
			},
			messages: {
				datePickerLabel: "Pick a delivery date:",
				noDateSelectedError: "Please select a delivery date before adding to the cart.",
				noAvailableDatesError: "There are currently no dates available for this product.",
				soldOut: "sold out"
			}
		})
	}
}

export function toWidgetSettings(schema: WidgetSettingsSchema): WidgetSettings {
	return new WidgetSettings(schema.shop_id, JSON.parse(schema.settings))
}
