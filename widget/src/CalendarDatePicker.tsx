import { h, Fragment } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { useEffect, useMemo, useState } from "preact/hooks"
import {
	DAY_OF_WEEK_TAG_DATE_FORMAT,
	SYSTEM_DATE_FORMAT,
	TAG_DATE_FORMAT,
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_DAY_OF_WEEK_TAG_LABEL, DEFAULT_SHOW_DAY_OF_WEEK_TAG
} from "../../backend/src/util/constants"
import { WidgetSettings } from "./models/WidgetSettings"
import { parseMoment } from "./util/dates"
import { FormAttributeName } from "./AvailableDatePicker"
import Calendar from "./Calendar"
import SingleDatePerOrderMessage from "./SingleDatePerOrderMessage"

interface Props {
	onSelect: (value: string) => void
	availableDates: AvailableDate[]
	settings: WidgetSettings
	formError: string | undefined
	formAttributeName: FormAttributeName
	showOnlyOnDatePerOrderMessage: boolean
}

export default function CalendarDatePicker({ availableDates, settings, onSelect, formError, formAttributeName, showOnlyOnDatePerOrderMessage }: Props) {

	const [selectedDate, setSelectedDate] = useState<string | undefined>(
		settings.dateDeselectedFirst ? undefined : availableDates[0]?.date
	)

	useEffect(() => {
		setSelectedDate(settings.dateDeselectedFirst ? undefined : availableDates[0]?.date)
	}, [availableDates])

	const dateTagLabel = settings.messages.dateTagLabel || DEFAULT_DATE_TAG_LABEL
	const dayOfWeekTagLabel = settings.messages.dayOfWeekTagLabel || DEFAULT_DAY_OF_WEEK_TAG_LABEL
	const showDayOfWeekTag = settings.showDayOfWeekTag ?? DEFAULT_SHOW_DAY_OF_WEEK_TAG

	const formattedSelectedDate = useMemo(() => {
		return selectedDate ? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT)?.format(TAG_DATE_FORMAT) : undefined
	}, [settings, selectedDate])

	const formattedSelectedDay = useMemo(() => {
		return selectedDate ? parseMoment(settings, selectedDate, SYSTEM_DATE_FORMAT)?.format(DAY_OF_WEEK_TAG_DATE_FORMAT) : undefined
	}, [settings, selectedDate])

	const handleSelectedDate = (strDay: string) => {
		setSelectedDate(strDay)
		onSelect(strDay)
	}

	return <Fragment>
		{formError && <div className="buunto-error-message">{formError}</div>}
		{formattedSelectedDate && <input type="hidden" name={`${formAttributeName}[${dateTagLabel}]`} value={formattedSelectedDate}/>}
		{formattedSelectedDay && showDayOfWeekTag && <input type="hidden" name={`${formAttributeName}[${dayOfWeekTagLabel}]`} value={formattedSelectedDay}/>}
		<Calendar
			availableDates={availableDates}
			selectedDate={selectedDate}
			onSelect={handleSelectedDate}
			settings={settings}
			hasFormError={!!formError}
		/>
		{showOnlyOnDatePerOrderMessage && <SingleDatePerOrderMessage settings={settings} />}
	</Fragment>
}
