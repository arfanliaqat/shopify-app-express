import React, { useState } from "react"
import { Tabs } from "@shopify/polaris"
import { TabDescriptor } from "@shopify/polaris/dist/types/latest/src/components/Tabs/types"
import WidgetPlacementPanel from "./WidgetPlacementPanel"
import AvailableDatesPanel from "./DateAvailabilityPanel"
import HomePanel from "./PlanPanel"
import TimeSlotsPanel from "./TimeSlotsPanel"
import MessagesPanel from "./MessagesPanel"
import WidgetSettingsPanel from "./WidgetCustomizationPanel"

interface Props {}

const tabs: TabDescriptor[] = [
	{
		id: "home",
		content: "Home"
	},
	{
		id: "widgetPlacement",
		content: "Widget placement"
	},
	{
		id: "availableDates",
		content: "Available dates"
	},
	{
		id: "timeSlots",
		content: "Time slots"
	},
	{
		id: "widgetSettings",
		content: "Widget settings"
	},
	{
		id: "messages",
		content: "Messages"
	}
]

export default function SettingsArea({}: Props) {
	const [hasChanges, setHasChanges] = useState(false)
	const [selectedTab, setSelectedTab] = useState(0)

	const handleTagSelect = (tab: number) => {
		if (
			!hasChanges ||
			window.confirm(
				"It looks like you have unsaved changes. Do you really want to navigate away and lose those changes?"
			)
		) {
			setSelectedTab(tab)
		}
	}

	const handleChangeTabClick = (tabId: string) => {
		const tabIndex = tabs.findIndex((tab) => tab.id == tabId)
		if (tabIndex) {
			setSelectedTab(tabIndex)
		}
	}

	return (
		<div id="settingsPage">
			<Tabs tabs={tabs} selected={selectedTab} onSelect={handleTagSelect}>
				{tabs[selectedTab]?.id == "home" && (
					<HomePanel onChange={setHasChanges} onChangeTabClick={handleChangeTabClick} />
				)}
				{tabs[selectedTab]?.id == "widgetPlacement" && <WidgetPlacementPanel onChange={setHasChanges} />}
				{tabs[selectedTab]?.id == "availableDates" && <AvailableDatesPanel onChange={setHasChanges} />}
				{tabs[selectedTab]?.id == "timeSlots" && <TimeSlotsPanel onChange={setHasChanges} />}
				{tabs[selectedTab]?.id == "widgetSettings" && <WidgetSettingsPanel onChange={setHasChanges} />}
				{tabs[selectedTab]?.id == "messages" && <MessagesPanel onChange={setHasChanges} />}
			</Tabs>
		</div>
	)
}
