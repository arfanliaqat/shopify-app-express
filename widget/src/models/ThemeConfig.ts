import { WidgetSettings } from "./WidgetSettings"

export interface DatePicker {
	settings?: WidgetSettings
	cartTags?: string[]
	cartCollections?: number[]
	productTags?: string[]
	productCollections?: number[]
	selectedDate?: string
}

export interface ThemeConfig {
	datePicker?: DatePicker
}

export function getThemeConfig(): ThemeConfig {
	return (window as any).Buunto || {}
}
