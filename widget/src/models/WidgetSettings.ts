export type PickerType = "CALENDAR" | "DROPDOWN"

export interface WidgetSettings {
	pickerType: PickerType
	styles: WidgetStyles
	messages: WidgetMessages
	dateFormats: DateFormats
}

export interface WidgetStyles {
	calendarBoxShadow: string
	calendarBorderRadius: string
	calendarBackgroundColor: string
	headerFontColor: string
	arrowIconColor: string
	headerDaysFontColor: string
	dayUnavailableFontColor: string
	dayAvailableFontColor: string
	dayHoveringBackgroundColor: string
	dayHoveringFontColor: string
	daySelectedBackgroundColor: string
	daySelectedFontColor: string
}

export interface WidgetMessages {
	datePickerLabel: string
	noDateSelectedError: string
	noAvailableDatesError: string
	soldOut: string
}

export interface DateFormats {
	weekStart: "MONDAY" | "SUNDAY"
	headerDays: string[]
	headerMonths: string[]
	dropdownDateFormat: string
}
