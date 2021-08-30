import React from "react"
import { Layout } from "@shopify/polaris"
import PreviewCard from "./PreviewCard"
import SettingsLayout from "./SettingsLayout"

interface Props {
	children: any,
	onChange: (hasChanges: boolean) => void
}

export default function SettingsLayoutWithPreview({ children, onChange }: Props) {
	return (
		<SettingsLayout onChange={onChange}>
			<Layout.Section>{children}</Layout.Section>
			<Layout.Section oneThird>
				<PreviewCard />
			</Layout.Section>
		</SettingsLayout>
	)
}
