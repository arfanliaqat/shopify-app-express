export type PickerType = "CALENDAR" | "DROPDOWN"

export interface WidgetSettings {
	pickerType: PickerType
	locale: string
	firstAvailableDateInDays: number
	cutOffTime: string
	lastAvailableDateInWeeks: number
	availableWeekDays: string[]
	disabledDates: string[]
	styles: WidgetStyles
	mandatoryDateSelect: boolean
	messages: WidgetMessages
	isVisible: boolean,
	singleDatePerOrder?: boolean
}

export interface WidgetStyles {
	errorFontColor: string
	calendarBoxShadow: string
	calendarBorderRadius: string
	calendarBackgroundColor: string
	headerFontColor: string
	arrowIconColor: string
	headerDaysFontColor: string
	headerDaysFontWeight: string
	dayUnavailableFontColor: string
	dayAvailableFontColor: string
	dayHoveringBackgroundColor: string
	dayHoveringFontColor: string
	daySelectedBackgroundColor: string
	daySelectedFontColor: string
	previewBackgroundColor: string
	dropdownBorderColor: string
	dropdownBorderWidth: string
	dropdownBackgroundColor: string
	dropdownTextColor: string
}

export interface WidgetMessages {
	datePickerLabel: string
	noDateSelectedError: string
	noAvailableDatesError: string
	soldOut: string
	dropdownDefaultOptionLabel?: string
	dateTagLabel?: string
	dayOfWeekTagLabel?: string
	singleDatePerOrderMessage?: string
}

