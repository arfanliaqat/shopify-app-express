import { WidgetSettings } from "./WidgetSettings"
import { AvailableDate } from "./AvailableDate"

export interface ProductAvailabilityData {
	settings: WidgetSettings
	availableDates: AvailableDate[]
}
