import { h, Fragment } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { WidgetSettings } from "./models/WidgetSettings"
import { FormAttributeName } from "./AvailableDatePicker"
import Calendar from "./Calendar"
import { useEffect, useMemo, useState } from "preact/hooks"
import {
	DAY_OF_WEEK_TAG_DATE_FORMAT,
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_DAY_OF_WEEK_TAG_LABEL, DEFAULT_SHOW_DAY_OF_WEEK_TAG,
	SYSTEM_DATE_FORMAT, TAG_DATE_FORMAT
} from "../../backend/src/util/constants"
import { parseMoment } from "./util/dates"
import { CalendarIcon } from "./Icons"
import classNames from "classnames"
import SingleDatePerOrderMessage from "./SingleDatePerOrderMessage"
import DatePickerInfoText from "./DatePickerInfoText"

interface Props {
	onSelect: (value: string) => void
	availableDates: AvailableDate[]
	settings: WidgetSettings
	formError: string | undefined
	formAttributeName: FormAttributeName
	showOnlyOnDatePerOrderMessage: boolean
	formId: string | undefined
}

export default function TextInputDatePicker({ onSelect, availableDates, settings, formError, formAttributeName, showOnlyOnDatePerOrderMessage, formId }: Props) {

	const [selectedDate, setSelectedDate] = useState<string | undefined>(
		settings.dateDeselectedFirst ? undefined : availableDates[0]?.date
	)

	const [open, setOpen] = useState<boolean>(undefined)

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
		setOpen(false)
	}

	useEffect(() => {
		const cb = (e) => {
			const target = e.target as Element
			if (target) {
				const isBuuntoCal = !!target.closest(".buuntoCal")
				const isTextInputHolder = !!target.closest(".buunto-text-input-holder")
				if (!isBuuntoCal && !isTextInputHolder) {
					setOpen(false)
				}
			}
		}
		document.addEventListener("click", cb)
		return () => {
			document.removeEventListener("click", cb)
		}
	}, [])

	return (
		<Fragment>
			{formError && <div className="buunto-error-message">{formError}</div>}
			<div className="buunto-text-input-date-picker buunto-field">
				<div className="buunto-text-input-holder">
					<div className="buunto-calendar-icon"><CalendarIcon/></div>
					<input
						className={classNames("buunto-text-input", { "buunto-error": !!formError })}
						type="text"
						name={`${formAttributeName}[${dateTagLabel}]`}
						value={formattedSelectedDate}
						onKeyDown={(e) => { e.preventDefault() }}
						onKeyUp={(e) => { e.preventDefault() }}
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							setOpen(true)
							return false
						}}
						form={formId}
					/>
					{formattedSelectedDay && showDayOfWeekTag && <input type="hidden" name={`${formAttributeName}[${dayOfWeekTagLabel}]`} value={formattedSelectedDay} form={formId} />}
					{open && <div className="buunto-popover">
					  <Calendar
						  availableDates={availableDates}
						  selectedDate={selectedDate}
						  onSelect={handleSelectedDate}
						  settings={settings}
					  />
					</div>}
				</div>
				{showOnlyOnDatePerOrderMessage && <SingleDatePerOrderMessage settings={settings} />}
				<DatePickerInfoText settings={settings} />
			</div>
		</Fragment>
	)
}
