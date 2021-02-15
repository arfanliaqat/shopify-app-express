import { WidgetSettings } from "./WidgetSettings"
import { AvailableDate } from "./AvailableDate"
import { AppOption } from "../../../backend/src/util/constants"

export interface ProductAvailabilityData {
	app: AppOption
	settings: WidgetSettings
	availableDates: AvailableDate[]
}
