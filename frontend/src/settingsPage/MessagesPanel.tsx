import React from "react"
import { Layout } from "@shopify/polaris"
import MessagesCard from "./MessagesCard"
import SettingsLayout from "./SettingsLayout"
import SettingsLayoutWithPreview from "./SettingsLayoutWithPreview"

interface Props {
	onChange: (hasChanges: boolean) => void
}

export default function MessagesPanel({ onChange }: Props) {
	return (
		<SettingsLayoutWithPreview onChange={onChange}>
			<MessagesCard />
		</SettingsLayoutWithPreview>
	)
}
