import React, { useEffect, useMemo } from "react"
import { ANCHOR_ID, PREVIEW_DATA_UPDATED_EVENT_NAME } from "../../../widget/src/constants"
import { getScriptTagsToCreate } from "../../../backend/src/scriptTags/scriptTags.model"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import moment from "moment"
import { ProductAvailabilityData } from "../../../widget/src/models/ProductAvailabilityData"
import { getDaysBetween } from "../util/tools"
import _ from "lodash"

interface Props {
	widgetSettings: WidgetSettings
}

function getMockProductAvailabilityData(settings: WidgetSettings): ProductAvailabilityData {
	const start = moment().startOf("day").add(settings.firstAvailableDateInDays, "day")
	const end = start.clone().add(settings.lastAvailableDateInWeeks, "weeks")
	const startOfFirstWeek = start.clone().startOf("week")
	const data = {
		settings,
		availableDates: _.flatten(
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
	return data
}

export default function Preview({ widgetSettings }: Props) {
	useEffect(() => {
		getScriptTagsToCreate().forEach((scriptTag) => {
			const script = document.createElement("script")
			script.src = scriptTag.src
			document.head.appendChild(script)
		})
	}, [])

	const jsonWidgetSettings = useMemo(() => JSON.stringify(getMockProductAvailabilityData(widgetSettings)), [
		widgetSettings
	])

	useEffect(() => {
		// eslint-disable-next-line no-undef
		const event = new CustomEvent(PREVIEW_DATA_UPDATED_EVENT_NAME)
		setTimeout(() => document.getElementById(ANCHOR_ID).dispatchEvent(event), 10)
	}, [jsonWidgetSettings])

	return (
		<div className="widgetPreview" style={{ background: widgetSettings.styles.previewBackgroundColor }}>
			<div id={ANCHOR_ID} data-preview="true" data-preview-data={jsonWidgetSettings} />
		</div>
	)
}
