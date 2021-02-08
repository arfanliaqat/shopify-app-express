import React, { useEffect, useMemo } from "react"
import { ANCHOR_ID, PREVIEW_DATA_UPDATED_EVENT_NAME } from "../../../widget/src/constants"
import { getScriptTagsToCreate } from "../../../backend/src/scriptTags/scriptTags.model"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import moment from "moment"
import { ProductAvailabilityData } from "../../../widget/src/models/ProductAvailabilityData"

interface Props {
	widgetSettings: WidgetSettings
}

function getMockProductAvailabilityData(settings: WidgetSettings): ProductAvailabilityData {
	return {
		settings,
		availableDates: [
			{
				date: moment().add(1, "day").format(SYSTEM_DATE_FORMAT),
				isSoldOut: false
			}
		]
	}
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
		setTimeout(() => document.getElementById(ANCHOR_ID).dispatchEvent(event), 100)
	}, [jsonWidgetSettings])

	return (
		<div className="widgetPreview" style={{ background: widgetSettings.styles.previewBackgroundColor }}>
			<div id={ANCHOR_ID} data-preview="true" data-preview-data={jsonWidgetSettings} />
		</div>
	)
}
