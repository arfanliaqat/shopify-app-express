import {
	DAY_OF_WEEK_TAG_DATE_FORMAT,
	SYSTEM_DATE_FORMAT,
	TAG_DATE_FORMAT,
	DEFAULT_DATE_TAG_LABEL,
	DEFAULT_DAY_OF_WEEK_TAG_LABEL,
	DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL,
	DEFAULT_SHOW_DAY_OF_WEEK_TAG
} from "../../backend/src/util/constants"
import { h, Fragment } from "preact"
import { AvailableDate } from "./models/AvailableDate"
import { WidgetSettings } from "./models/WidgetSettings"
import { parseMoment } from "./util/dates"
import { useMemo } from "preact/hooks"
import classNames from "classnames"
import { FormAttributeName } from "./AvailableDatePicker"
import SingleDatePerOrderMessage from "./SingleDatePerOrderMessage"
import DatePickerInfoText from "./DatePickerInfoText"

interface Props {
	onSelect: (value: string) => void
	availableDates: AvailableDate[]
	selectedAvailableDate: string | undefined
	settings: WidgetSettings
	formError: string | undefined
	formAttributeName: FormAttributeName
	showOnlyOnDatePerOrderMessage: boolean
	formId: string | undefined
}

export default function DropdownDatePicker({ settings, onSelect, availableDates, selectedAvailableDate, formError, formAttributeName, showOnlyOnDatePerOrderMessage, formId }: Props) {
	const handleSelect = (e) => {
		if (e.target.value) {
			onSelect(e.target.value)
		} else {
			onSelect(undefined)
		}
	}

	const formattedSelectedDay = useMemo(() => {
		return selectedAvailableDate
			? parseMoment(settings, selectedAvailableDate, TAG_DATE_FORMAT)?.format(DAY_OF_WEEK_TAG_DATE_FORMAT)
			: undefined
	}, [settings, selectedAvailableDate])

	const dateTagLabel = settings.messages.dateTagLabel || DEFAULT_DATE_TAG_LABEL
	const dayOfWeekTagLabel = settings.messages.dayOfWeekTagLabel || DEFAULT_DAY_OF_WEEK_TAG_LABEL
	const dropdownDefaultOptionLabel = settings.messages.dropdownDefaultOptionLabel || DEFAULT_DROPDOWN_DEFAULT_OPTION_LABEL
	const showDayOfWeekTag = settings.showDayOfWeekTag ?? DEFAULT_SHOW_DAY_OF_WEEK_TAG

	return (
		<Fragment>
			{formError && <div className="buunto-error-message">{formError}</div>}
			<div className="buunto-field">
				<select className={classNames("buunto-date-picker-dropdown", "buunto-dropdown", { "buunto-error": !!formError })}
						name={`${formAttributeName}[${dateTagLabel}]`}
						onChange={handleSelect}
						form={formId}>
					{settings.dateDeselectedFirst && <option value="">{dropdownDefaultOptionLabel}</option>}
					{availableDates.map((availableDate) => {
						const momentDate = parseMoment(settings, availableDate.date, SYSTEM_DATE_FORMAT)
						const valueDate = momentDate.format(TAG_DATE_FORMAT)
						return <option value={valueDate} disabled={availableDate.isSoldOut}
									   selected={valueDate == selectedAvailableDate}>
							{momentDate.format("dddd, LL")}
							{availableDate.isSoldOut && settings.messages.soldOut ? ` (${settings.messages.soldOut})` : ""}
						</option>
					})}
				</select>
				{formattedSelectedDay && showDayOfWeekTag && <input type="hidden" name={`${formAttributeName}[${dayOfWeekTagLabel}]`} value={formattedSelectedDay} form={formId} />}
				{showOnlyOnDatePerOrderMessage && <SingleDatePerOrderMessage settings={settings} />}
				<DatePickerInfoText settings={settings} />
			</div>
		</Fragment>
	)
}
