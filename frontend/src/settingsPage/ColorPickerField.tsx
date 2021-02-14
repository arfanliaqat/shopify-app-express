import React, { useState } from "react"
import { Popover, ColorPicker, TextField, rgbToHsb, hsbToHex } from "@shopify/polaris"
import { hexToRgb } from "../util/tools"

interface Props {
	label: string
	onChange: (value: string) => void
	value: string
}

export default function ColorPickerField({ label, onChange, value }: Props) {
	const [openPicker, setOpenPicker] = useState(false)
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
					<TextField
						label={label}
						onChange={onChange}
						value={value}
						onFocus={() => setOpenPicker(true)}
						maxLength={7}
						prefix={<div style={colorSquareStyle} />}
					/>
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
