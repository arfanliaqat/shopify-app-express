import React, { useMemo, useState } from "react"
import { Popover, ColorPicker, TextField, rgbToHsb, hsbToHex, InlineError } from "@shopify/polaris"
import { hexToRgb } from "../util/tools"

interface Props {
	fieldId: string
	label: string
	onChange: (value: string) => void
	value: string
}

export default function ColorPickerField({ fieldId, label, onChange, value }: Props) {
	const [openPicker, setOpenPicker] = useState(false)

	const isValid = useMemo(() => !value || /^#[a-f0-9A-F]{6}$/.test(value), [value])

	const colorSquareStyle = {
		backgroundColor: value,
		width: "12px",
		height: "12px"
	}

	return (
		<>
			<Popover
				active={openPicker}
				sectioned
				preferredAlignment="left"
				activator={
					<>
						<TextField
							label={label}
							id={fieldId}
							error={!isValid}
							onChange={onChange}
							value={value}
							onFocus={() => setOpenPicker(true)}
							maxLength={7}
							prefix={<div style={colorSquareStyle} />}
							placeholder="Default color"
						/>
						{!isValid && (
							<InlineError
								fieldID={fieldId}
								message="Incorrect format. An hexadecimal color code is expected. For example: #a0a0a0. Don't forget the leading '#'."
							/>
						)}
					</>
				}
				onClose={() => {
					setOpenPicker(false)
				}}
			>
				<Popover.Pane fixed>
					<Popover.Section>
						<ColorPicker
							color={rgbToHsb(hexToRgb(value || "#ffffff"))}
							onChange={(hsb) => onChange(hsbToHex(hsb))}
						/>
					</Popover.Section>
				</Popover.Pane>
			</Popover>
		</>
	)
}
