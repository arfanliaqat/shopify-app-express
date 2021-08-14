export interface TimeSlot {
	from: string,
	to: string
}

export type PickerType = "CALENDAR" | "DROPDOWN" | "TEXT_INPUT"
export type WeekDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"
export type ConfigDay = "DEFAULT" | WeekDay
export type TimeSlotsByDay = { [D in ConfigDay]: TimeSlot[] }
export type Page = "PRODUCT" | "CART"
export type PlacementMethod = "AUTOMATIC" | "MANUAL"
export type AnchorPosition = "BEFORE" | "FIRST_ELEMENT" | "LAST_ELEMENT" | "AFTER"
export type FilterType = "ALL" | "COLLECTIONS" | "PRODUCT_TAGS"

export interface Collection {
	id: number
	title: string
}

export interface WidgetSettings {
	pickerType: PickerType
	locale: string
	firstAvailableDateInDays: number
	cutOffTime: string
	skipUnavailableDates?: boolean
	lastAvailableDateInWeeks: number
	availableWeekDays: WeekDay[]
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
	timeSlotsByDay?: TimeSlotsByDay
	showOnPage?: Page
	placementMethod?: PlacementMethod
	anchorSelector?: string
	anchorPosition?: AnchorPosition
	filterType?: FilterType
	filterCollections?: Collection[]
	filterProductTags?: string[]
	showDayOfWeekTag?: boolean
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
	datePickerInfoText?: string
}

