export type PickerType = "CALENDAR" | "DROPDOWN"

export interface WidgetSettings {
	pickerType: PickerType
	locale: string,
	styles: WidgetStyles
	messages: WidgetMessages
}

export interface WidgetStyles {
	errorFontColor: string
	calendarBoxShadow: string
	calendarBorderRadius: string
	calendarBackgroundColor: string
	headerFontColor: string
	arrowIconColor: string
	headerDaysFontColor: string
	headerFontWeight: string
	dayUnavailableFontColor: string
	dayAvailableFontColor: string
	dayHoveringBackgroundColor: string
	dayHoveringFontColor: string
	daySelectedBackgroundColor: string
	daySelectedFontColor: string
	previewBackgroundColor: string
}

export interface WidgetMessages {
	datePickerLabel: string
	noDateSelectedError: string
	noAvailableDatesError: string
	soldOut: string
}

