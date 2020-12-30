import React from "react"
import { Checkbox } from "@shopify/polaris"

interface Props {
	checked: boolean
	onChange: (boolean) => void
}

export default function QuantityIsSharedCheckbox({ checked, onChange }: Props) {
	return (
		<Checkbox
			label="Share quantity across all dates"
			helpText="When checked the same quantity is tied to all the dates: if an order is made in any of the defined days the quantity decreases for the whole availability period."
			checked={checked}
			onChange={(isShared) => onChange(isShared)}
		/>
	)
}
