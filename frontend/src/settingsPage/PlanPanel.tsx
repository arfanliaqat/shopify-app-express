import React from "react"
import { Layout } from "@shopify/polaris"
import CurrentPlanCard from "./CurrentPlanCard"
import SettingsLayout from "./SettingsLayout"
import GettingStartedCard from "./GettingStartedCard"

interface Props {
	onChange: (hasChanges: boolean) => void
	onChangeTabClick: (tabId: string) => void
}

export default function PlanPanel({ onChange, onChangeTabClick }: Props) {
	return (
		<SettingsLayout noSaveBar onChange={onChange}>
			<Layout.Section>
				<CurrentPlanCard />
			</Layout.Section>
			<Layout.Section>
				<GettingStartedCard onChangeTabClick={onChangeTabClick} />
			</Layout.Section>
		</SettingsLayout>
	)
}
