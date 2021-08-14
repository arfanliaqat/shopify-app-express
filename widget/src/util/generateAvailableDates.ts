import { WeekDay, WidgetSettings } from "../models/WidgetSettings"
import { AvailableDate } from "../models/AvailableDate"
import { getMoment } from "./dates"
import moment, { Moment } from "moment"
import { getDaysBetween } from "../../../frontend/src/util/tools"
import { SYSTEM_DATE_FORMAT, SYSTEM_DATETIME_FORMAT } from "../../../backend/src/util/constants"

export function getCutoffTime(availableWeekDays: WeekDay[], cutoffTime: string, refDate: Moment, skipUnavailableDates: boolean): Moment {
	const refWeekDay = refDate.format("dddd").toUpperCase() as WeekDay
	if (!skipUnavailableDates || availableWeekDays.length == 0 || availableWeekDays.includes(refWeekDay)) {
		return moment(refDate.format(SYSTEM_DATE_FORMAT) + " " + cutoffTime + ":00", SYSTEM_DATETIME_FORMAT)
	} else {
		return getCutoffTime(availableWeekDays, cutoffTime, refDate.clone().subtract(1, "day"), skipUnavailableDates)
	}
}

export function generateAvailableDates(settings?: WidgetSettings, refDate?: Moment): AvailableDate[] {
	if (!settings) return []
	const now = getMoment(settings, refDate)
	const today = now.clone().startOf("day")
	const cutOffTime = getCutoffTime(settings.availableWeekDays, settings.cutOffTime, today, settings.skipUnavailableDates ?? false)
	const needsExtraDay = now.isAfter(cutOffTime, "minute")
	const firstDay = today.clone().add(settings.firstAvailableDateInDays, "days")
	const lastDay = today.clone().add(settings.lastAvailableDateInWeeks, "weeks").endOf("weeks")
	const availableWeekDaysSet = new Set(settings.availableWeekDays)
	const disabledDatesSet = new Set(settings.disabledDates)
	const availableDates = getDaysBetween(firstDay, lastDay, "day")
		.filter((date) => {
			const matchesPattern = availableWeekDaysSet.has(date.format("dddd").toUpperCase() as WeekDay)
			if (!matchesPattern) return false
			const matchesDisabledDate = disabledDatesSet.has(date.format(SYSTEM_DATE_FORMAT))
			return !matchesDisabledDate
		})
		.map((date) => ({
			date: date.format(SYSTEM_DATE_FORMAT),
			isSoldOut: false
		}))
	if (needsExtraDay) {
		availableDates.shift()
	}
	return availableDates
}
