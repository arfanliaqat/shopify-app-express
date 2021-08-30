import React from "react"
import { Layout } from "@shopify/polaris"
import DatePickerPlacementCard from "./DatePickerPlacementCard"
import SettingsLayout from "./SettingsLayout"

interface Props {
	onChange: (hasChanges: boolean) => void
}

export default function WidgetPlacementPanel({ onChange }: Props) {
	return (
		<SettingsLayout onChange={onChange}>
			<Layout.Section>
				<DatePickerPlacementCard />
			</Layout.Section>
		</SettingsLayout>
	)
}
