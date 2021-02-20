import React, { useEffect, useMemo, useState } from "react"
import { Tag, Button, Popover, DatePicker } from "@shopify/polaris"
import { SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import moment from "moment"

interface Props {
	dates: string[]
	onChange: (value: string[]) => void
}

const today = moment()

export default function DisabledDates({ dates, onChange }: Props) {
	const [addDateOpen, setAddDateOpen] = useState<boolean>()

	const [{ month, year }, setCalendarMonth] = useState({
		month: today.month(),
		year: today.year()
	})

	const momentDates = useMemo(() => dates.map((d) => moment(d, SYSTEM_DATE_FORMAT)), [dates])

	useEffect(() => {
		// Get rid of past dates
		const filteredMomentDates = momentDates.filter((md) => !md.isBefore(today, "day"))
		if (filteredMomentDates.length < momentDates.length) {
			onChange(filteredMomentDates.map((md) => md.format(SYSTEM_DATE_FORMAT)))
		}
	}, [])

	const handleRemove = (strDate: string) => () => {
		const datesCopy = [...dates]
		const index = datesCopy.findIndex((d) => d == strDate)
		datesCopy.splice(index, 1)
		onChange(datesCopy)
	}

	const togglePopoverActive = () => setAddDateOpen((active) => !active)

	return (
		<div className="disabledDates">
			<div className="fieldLabel">Disabled dates</div>
			<div className="tags">
				{momentDates.map((md, index) => {
					const strDate = md.format(SYSTEM_DATE_FORMAT)
					return (
						<Tag key={index} onRemove={handleRemove(strDate)}>
							{md.format("D MMM YYYY")}
						</Tag>
					)
				})}
				{momentDates.length == 0 && <em>No disabled dates defined</em>}
			</div>
			<Popover
				activator={
					<Button onClick={togglePopoverActive} disclosure>
						Add date
					</Button>
				}
				active={addDateOpen}
				onClose={() => setAddDateOpen(false)}
				preferredAlignment="left"
			>
				<div className="datePickerHolder">
					<DatePicker
						month={month}
						year={year}
						onMonthChange={(month, year) => setCalendarMonth({ month, year })}
						onChange={(date) => {
							const strDate = moment(date.start).format(SYSTEM_DATE_FORMAT)
							if (!dates.find((d) => d == strDate)) {
								onChange([...dates, strDate].sort())
							}
							setAddDateOpen(false)
						}}
						disableDatesBefore={today.toDate()}
					/>
				</div>
			</Popover>
		</div>
	)
}
