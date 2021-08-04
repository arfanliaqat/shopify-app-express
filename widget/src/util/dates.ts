import { TimeSlot, WidgetSettings } from "../models/WidgetSettings"
import moment, { Moment } from "moment"
import { SYSTEM_DATE_FORMAT, SYSTEM_DATETIME_FORMAT } from "../../../backend/src/util/constants"

export function getMoment(settings: WidgetSettings, refDate?: Moment): Moment {
	return moment(refDate ?? moment(), settings.locale)
}

export function parseMoment(settings: WidgetSettings, strDate: string, dateFormat: string): Moment {
	return moment(strDate, dateFormat, settings.locale)
}

export function formatLocaleTime(settings: WidgetSettings, strTime: string) {
	const strDate = moment().format(SYSTEM_DATE_FORMAT)
	return parseMoment(settings, strDate + " " + strTime + ":00", SYSTEM_DATETIME_FORMAT).format("LT")
}

export function toTimeSlotDisplay(settings: WidgetSettings, timeSlot: TimeSlot): string {
	return `${formatLocaleTime(settings, timeSlot.from)} - ${formatLocaleTime(settings, timeSlot.to)}`
}
