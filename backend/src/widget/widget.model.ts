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
			calendarWeekStart: "MONDAY",
			dropdownDateFormat: "dddd D MMMM",
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
				daySelectedFontColor: "#ffffff"
			},
			messages: {
				datePickerLabel: "Pick a delivery date:",
				noDateSelectedError: "Please select a delivery date before adding to the cart.",
				noAvailableDatesError: "There are currently no dates available for this product.",
				soldOut: "sold out",
				headerDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
				headerMonths: [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December"
				]
			}
		})
	}
}

export function toWidgetSettings(schema: WidgetSettingsSchema): WidgetSettings {
	return new WidgetSettings(schema.shop_id, JSON.parse(schema.settings))
}
