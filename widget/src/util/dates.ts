import { TimeSlot, WidgetSettings } from "../models/WidgetSettings"
import moment, { Moment } from "moment"
import { SYSTEM_DATE_FORMAT, SYSTEM_DATETIME_FORMAT } from "../../../backend/src/util/constants"

export function getMoment(settings?: WidgetSettings | undefined, refDate?: Moment): Moment {
	return moment(refDate ?? moment(), settings?.locale)
}

export function parseMoment(settings: WidgetSettings | undefined, strDate: string, dateFormat: string): Moment {
	return moment(strDate, dateFormat, settings?.locale)
}

export function formatLocaleTime(settings: WidgetSettings | undefined, strTime: string) {
	const strDate = moment().format(SYSTEM_DATE_FORMAT)
	return parseMoment(settings, strDate + " " + strTime + ":00", SYSTEM_DATETIME_FORMAT).format("LT")
}

export function toTimeSlotDisplay(settings: WidgetSettings | undefined, timeSlot: TimeSlot): string {
	return `${formatLocaleTime(settings, timeSlot.from)} - ${formatLocaleTime(settings, timeSlot.to)}`
}
