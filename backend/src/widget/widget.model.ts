import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import { allWeekDays } from "../util/constants"

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
			firstAvailableDateInDays: 1,
			cutOffTime: "23:59",
			lastAvailableDateInWeeks: 12,
			availableWeekDays: allWeekDays,
			disabledDates: [],
			mandatoryDateSelect: true,
			isVisible: true,
			styles: {
				errorFontColor: "#8b0000",
				calendarBoxShadow: "0 0 5px rgba(0,0,0,0.15)",
				calendarBorderRadius: "10px",
				calendarBackgroundColor: "#ffffff",
				headerFontColor: "#333333",
				arrowIconColor: "#000000",
				headerDaysFontColor: "#333333",
				dayUnavailableFontColor: "#aaaaaa",
				dayAvailableFontColor: "#333333",
				dayHoveringBackgroundColor: "#eeeeee",
				dayHoveringFontColor: "#333333",
				daySelectedBackgroundColor: "#333333",
				daySelectedFontColor: "#ffffff",
				previewBackgroundColor: "#ffffff",
				headerDaysFontWeight: "bold",
				dropdownBackgroundColor: "#ffffff",
				dropdownBorderColor: "#cccccc",
				dropdownBorderWidth: "1px",
				dropdownTextColor: "#333333"
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
