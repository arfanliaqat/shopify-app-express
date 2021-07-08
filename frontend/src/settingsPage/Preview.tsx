import React, { useEffect, useMemo } from "react"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import moment from "moment"
import { ProductAvailabilityData } from "../../../widget/src/models/ProductAvailabilityData"
import { getDaysBetween } from "../util/tools"
import _ from "lodash"
import { anchorId, isStockByDateApp, widgetScriptName } from "../common/constants"
import { AvailableDate } from "../../../widget/src/models/AvailableDate"

interface Props {
	widgetSettings: WidgetSettings
}

function getMockAvailableDates(settings: WidgetSettings): AvailableDate[] {
	const start = moment().startOf("day").add(settings.firstAvailableDateInDays, "day")
	const end = start.clone().add(settings.lastAvailableDateInWeeks, "weeks")
	const startOfFirstWeek = start.clone().startOf("week")
	if (!isStockByDateApp) {
		return []
	}
	return _.flatten(
		getDaysBetween(startOfFirstWeek, end, "week").map((startOfWeek) => {
			return getDaysBetween(startOfWeek.clone().day("monday"), startOfWeek.clone().day("saturday"), "day")
				.filter((date) => date.isAfter(start))
				.map((date) => ({
					date: date.format(SYSTEM_DATE_FORMAT),
					isSoldOut: false
				}))
		})
	)
}

function getMockProductAvailabilityData(settings: WidgetSettings): ProductAvailabilityData {
	const data = {
		settings,
		availableDates: getMockAvailableDates(settings)
	}
	if (isStockByDateApp) {
		const nextWeekThursday = moment(data.availableDates[0].date, SYSTEM_DATE_FORMAT)
			.add(1, "week")
			.day("thursday")
			.format(SYSTEM_DATE_FORMAT)
		const nextWeekFriday = moment(data.availableDates[0].date, SYSTEM_DATE_FORMAT)
			.add(1, "week")
			.day("friday")
			.format(SYSTEM_DATE_FORMAT)
		const thursdayDate = data.availableDates.find((ad) => ad.date == nextWeekThursday)
		const fridayDate = data.availableDates.find((ad) => ad.date == nextWeekFriday)
		if (thursdayDate) thursdayDate.isSoldOut = true
		if (fridayDate) fridayDate.isSoldOut = true
	}
	return data
}

let timeoutId: any
export default function Preview({ widgetSettings }: Props) {
	useEffect(() => {
		const script = document.createElement("script")
		script.src = `/widget/build/${widgetScriptName}`
		document.head.appendChild(script)
	}, [])

	const jsonWidgetSettings = useMemo(() => JSON.stringify(getMockProductAvailabilityData(widgetSettings)), [
		widgetSettings
	])

	useEffect(() => {
		// eslint-disable-next-line no-undef
		const event = new CustomEvent("previewDataUpdated")
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
		timeoutId = setTimeout(() => {
			document.getElementById(anchorId).dispatchEvent(event)
		}, 200)
	}, [jsonWidgetSettings])

	return (
		<div className="widgetPreview" style={{ background: widgetSettings.styles.previewBackgroundColor }}>
			<div id={anchorId} data-preview="true" data-preview-data={jsonWidgetSettings} />
			<div className="errorMessagePreview" style={{ color: widgetSettings.styles.errorFontColor }}>
				This is an example error message.
			</div>
		</div>
	)
}
