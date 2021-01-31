import { WidgetSettings } from "../models/WidgetSettings"
import moment, { Moment } from "moment"

export function getMoment(settings: WidgetSettings): Moment {
	return moment(settings.locale)
}

export function parseMoment(settings: WidgetSettings, strDate: string, dateFormat: string): Moment {
	return moment(strDate, dateFormat, settings.locale)
}

