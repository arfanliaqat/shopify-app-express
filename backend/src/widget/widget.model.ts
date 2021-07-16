import { WidgetSettings as WidgetSettingsViewModel } from "../../../widget/src/models/WidgetSettings"
import {
	allWeekDays,
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_DAY_OF_WEEK_TAG_LABEL,
	DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_NO_TIME_SLOT_SELECTED_ERROR, DEFAULT_SHOW_ON_PAGE,
	DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE,
	DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_TIME_SLOT_LABEL,
	DEFAULT_TIME_SLOT_TAG_LABEL,
	defaultWidgetStyles
} from "../util/constants"

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
			isVisible: false,
			singleDatePerOrder: false,
			dateDeselectedFirst: false,
			timeSlotDeselectedFirst: false,
			showOnPage: DEFAULT_SHOW_ON_PAGE,
			styles: {
				errorFontColor: "#8b0000",
				errorBorderColor: defaultWidgetStyles.errorBorderColor,
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
				soldOut: "sold out",
				dropdownDefaultOptionLabel: DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL,
				dateTagLabel: DEFAULT_DATE_TAG_LABEL,
				dayOfWeekTagLabel: DEFAULT_DAY_OF_WEEK_TAG_LABEL,
				singleDatePerOrderMessage: DEFAULT_SINGLE_DATE_PER_ORDER_MESSAGE,
				timeSlotLabel: DEFAULT_TIME_SLOT_LABEL,
				timeSlotTagLabel: DEFAULT_TIME_SLOT_TAG_LABEL,
				noTimeSlotSelectedError: DEFAULT_NO_TIME_SLOT_SELECTED_ERROR,
				timeSlotDropdownDefaultOptionLabel: DEFAULT_TIME_SLOT_DROPDOWN_DEFAULT_OPTION_LABEL
			}
		})
	}
}

export function toWidgetSettings(schema: WidgetSettingsSchema): WidgetSettings {
	return new WidgetSettings(schema.shop_id, JSON.parse(schema.settings))
}
