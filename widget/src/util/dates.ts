import { WidgetSettings } from "../models/WidgetSettings"
import moment, { Moment } from "moment"

export function getMoment(settings: WidgetSettings, refDate?: Moment): Moment {
	return moment(refDate ?? moment(), settings.locale)
}

export function parseMoment(settings: WidgetSettings, strDate: string, dateFormat: string): Moment {
	return moment(strDate, dateFormat, settings.locale)
}

