import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Layout, Page, PageActions } from "@shopify/polaris"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { useApi } from "../util/useApi"
import { Toast } from "@shopify/app-bridge-react"
import _ from "lodash"
import ResetSettingsModal from "./ResetSettingsModal"
import AvailabilitySettingsCard from "./AvailabilitySettingsCard"
import DatePickerSettingsCard from "./DatePickerSettingsCard"
import CalendarStylesCard from "./CalendarStylesCard"
import MessagesCard from "./MessagesCard"
import PreviewCard from "./PreviewCard"
import SettingsPageSkeleton from "./SettingsPageSkeleton"
import DropdownStylesCard from "./DropdownStylesCard"
import { isStockByDateApp } from "../common/constants"
import ShopPlan from "../models/ShopPlan"
import { plans } from "../../../backend/src/util/constants"
import CurrentPlanCard from "./CurrentPlanCard"

interface Props {}

interface WidgetSettingsPageData {
	currentOrderCount: number
	plan: ShopPlan
	settings: WidgetSettings
}

export default function SettingsPage({}: Props) {
	const [initialWidgetSettings, setInitialWidgetSettings] = useState<WidgetSettings>(undefined)
	const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(undefined)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [reloadIncrement, setReloadIncrement] = useState<number>(0)
	const [resetSettingsModalOpen, setResetSettingsModalOpen] = useState(false)
	const [shopPlan, setShopPlan] = useState<ShopPlan>(undefined)
	const [currentOrderCount, setCurrentOrderCount] = useState<number>(undefined)

	const { setApiRequest: fetchPeriod, isLoading } = useApi<WidgetSettingsPageData>({
		onSuccess: useCallback((response) => {
			setCurrentOrderCount(response.currentOrderCount)
			setShopPlan(response.plan)
			setInitialWidgetSettings({ ...response.settings })
			setWidgetSettings({ ...response.settings })
		}, [])
	})

	const { setApiRequest: saveSettings, isLoading: isSaving } = useApi({
		onSuccess: useCallback(() => {
			setSuccessMessage("Settings saved!")
			setReloadIncrement(reloadIncrement + 1)
		}, [reloadIncrement])
	})

	useEffect(() => {
		fetchPeriod({
			url: `/widget_settings`
		})
	}, [reloadIncrement])

	const handleSaveSettingsClick = () => {
		saveSettings({
			method: "POST",
			url: "/widget_settings",
			postData: widgetSettings
		})
	}

	const handleResetSettingsSuccess = (resetSettings) => {
		setInitialWidgetSettings({ ...resetSettings })
		setWidgetSettings({ ...resetSettings })
		setResetSettingsModalOpen(false)
		setSuccessMessage("Settings successfully reset!")
	}

	const isDirty = useMemo(() => {
		if (widgetSettings && widgetSettings) {
			return !_.isEqual(initialWidgetSettings, widgetSettings)
		}
		return false
	}, [initialWidgetSettings, widgetSettings])

	if (!widgetSettings || isLoading) {
		return <SettingsPageSkeleton />
	}

	return (
		<div id="settingsPage">
			{successMessage && <Toast content={successMessage} onDismiss={() => setSuccessMessage(undefined)} />}
			<Page
				breadcrumbs={isStockByDateApp && [{ content: "Products", url: "/app" }]}
				title={isStockByDateApp && "Settings"}
				separator={isStockByDateApp}
			>
				<Layout>
					<Layout.Section>
						<CurrentPlanCard currentOrderCount={currentOrderCount} planOptions={plans[shopPlan.plan]} />
					</Layout.Section>
				</Layout>
				<div className="pageSeparator" />
				<Layout>
					<Layout.Section>
						<AvailabilitySettingsCard
							widgetSettings={widgetSettings}
							onWidgetSettingsChange={setWidgetSettings}
						/>
					</Layout.Section>
				</Layout>
				<div className="pageSeparator" />
				<Layout>
					<Layout.Section>
						<Layout>
							<Layout.Section>
								<DatePickerSettingsCard
									widgetSettings={widgetSettings}
									onWidgetSettingsChange={setWidgetSettings}
								/>
							</Layout.Section>

							{widgetSettings.pickerType == "CALENDAR" && (
								<Layout.Section>
									<CalendarStylesCard
										widgetSettings={widgetSettings}
										onWidgetSettingsChange={setWidgetSettings}
									/>
								</Layout.Section>
							)}

							{widgetSettings.pickerType == "DROPDOWN" && (
								<Layout.Section>
									<DropdownStylesCard
										widgetSettings={widgetSettings}
										onWidgetSettingsChange={setWidgetSettings}
									/>
								</Layout.Section>
							)}
						</Layout>
					</Layout.Section>
					<Layout.Section oneThird>
						<PreviewCard widgetSettings={widgetSettings} onWidgetSettingsChange={setWidgetSettings} />
					</Layout.Section>
				</Layout>
				<div className="pageSeparator" />
				<Layout>
					<Layout.Section>
						<MessagesCard widgetSettings={widgetSettings} onWidgetSettingsChange={setWidgetSettings} />
					</Layout.Section>
				</Layout>
				<PageActions
					primaryAction={{
						content: "Save",
						onAction: handleSaveSettingsClick,
						loading: isSaving,
						disabled: !isDirty
					}}
					secondaryActions={[
						{
							content: "Reset settings",
							destructive: true,
							onAction: () => setResetSettingsModalOpen(true)
						}
					]}
				/>
			</Page>
			{resetSettingsModalOpen && (
				<ResetSettingsModal
					onSuccess={handleResetSettingsSuccess}
					onClose={() => setResetSettingsModalOpen(false)}
				/>
			)}
		</div>
	)
}
