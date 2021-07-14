export type PickerType = "CALENDAR" | "DROPDOWN"

export interface TimeSlot {
	from: string,
	to: string
}

export type ConfigDay = "DEFAULT" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"
export type TimeSlotByDay = { [D in ConfigDay]: TimeSlot[] }

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
	dateDeselectedFirst?: boolean
	messages: WidgetMessages
	isVisible: boolean,
	singleDatePerOrder?: boolean
	timeSlotsEnabled?: boolean
	mandatoryTimeSlot?: boolean
	timeSlotDeselectedFirst?: boolean
	timeSlotsByDay?: TimeSlotByDay
}

export interface WidgetStyles {
	errorFontColor: string
	errorBorderColor?: string
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
	dayOfWeekTagLabel?: string
	singleDatePerOrderMessage?: string
	timeSlotTagLabel?: string
	timeSlotLabel?: string
	dateTagLabel?: string
	noTimeSlotSelectedError?: string
	timeSlotDropdownDefaultOptionLabel?: string
}

