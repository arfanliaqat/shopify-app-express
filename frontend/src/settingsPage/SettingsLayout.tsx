import React, { createContext, useCallback, useEffect, useMemo, useState } from "react"
import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"
import { useApi } from "../util/useApi"
import ShopPlan from "../models/ShopPlan"
import { PageActions, Page, Layout } from "@shopify/polaris"
import ResetSettingsModal from "./ResetSettingsModal"
import { Toast, useAppBridge } from "@shopify/app-bridge-react"
import { useHistory } from "react-router"
import SettingsPageSkeleton from "./SettingsPageSkeleton"
import { isStockByDateApp } from "../common/constants"
import _ from "lodash"

interface Props {
	children: any
	noSaveBar?: boolean
	onChange: (hasChanges: boolean) => void
}

interface WidgetSettingsPageData {
	currentOrderCount: number
	plan: ShopPlan
	settings: WidgetSettings
}

export interface SettingsLayoutContextState {
	initialWidgetSettings?: WidgetSettings
	widgetSettings?: WidgetSettings
	setWidgetSettings: (WidgetSettings) => void
	currentOrderCount?: number
	shopPlan?: ShopPlan
}

export const SettingsLayoutContext = createContext<SettingsLayoutContextState>({
	setWidgetSettings: () => {}
})

export default function SettingsLayout({ children, noSaveBar, onChange }: Props) {
	const app = useAppBridge()
	const [initialWidgetSettings, setInitialWidgetSettings] = useState<WidgetSettings>(undefined)
	const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(undefined)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [reloadIncrement, setReloadIncrement] = useState<number>(0)
	const [shopPlan, setShopPlan] = useState<ShopPlan | undefined>(undefined)
	const [currentOrderCount, setCurrentOrderCount] = useState<number>(undefined)

	const { setApiRequest: fetchPeriod, isLoading } = useApi<WidgetSettingsPageData>(
		{
			onSuccess: useCallback((response) => {
				setCurrentOrderCount(response.currentOrderCount)
				setShopPlan(response.plan)
				setInitialWidgetSettings({ ...response.settings })
				setWidgetSettings({ ...response.settings })
			}, [])
		},
		app
	)

	const { setApiRequest: saveSettings, isLoading: isSaving } = useApi(
		{
			onSuccess: useCallback(() => {
				setSuccessMessage("Settings saved!")
				setReloadIncrement(reloadIncrement + 1)
			}, [reloadIncrement])
		},
		app
	)

	useEffect(() => {
		fetchPeriod({
			url: `/widget_settings`
		})
	}, [reloadIncrement])

	const history = useHistory()

	const [resetSettingsModalOpen, setResetSettingsModalOpen] = useState(false)

	useEffect(() => {
		// Redirect to the plan's page if not plans are yet selected
		if (widgetSettings && !shopPlan) {
			history.push("/app/plans")
		}
	}, [widgetSettings, shopPlan, history])

	const hasChanges = useMemo(() => {
		if (widgetSettings && widgetSettings) {
			return !_.isEqual(initialWidgetSettings, widgetSettings)
		}
		return false
	}, [initialWidgetSettings, widgetSettings])

	useEffect(() => {
		onChange(hasChanges)
	}, [hasChanges])

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

	if (!widgetSettings || isLoading || !shopPlan) {
		return <SettingsPageSkeleton />
	}

	return (
		<SettingsLayoutContext.Provider
			value={{ ...{ initialWidgetSettings, shopPlan, currentOrderCount, widgetSettings, setWidgetSettings } }}
		>
			{successMessage && <Toast content={successMessage} onDismiss={() => setSuccessMessage(undefined)} />}
			<Page
				breadcrumbs={isStockByDateApp && [{ content: "Products", url: "/app" }]}
				title={isStockByDateApp && "Settings"}
			>
				<div style={{ minHeight: "300px" }}>
					<Layout>{children}</Layout>
				</div>
				{!noSaveBar && (
					<>
						<div style={{ height: "20px" }} />
						<PageActions
							primaryAction={{
								content: "Save",
								onAction: handleSaveSettingsClick,
								loading: isSaving
							}}
							secondaryActions={[
								{
									content: "Reset settings",
									destructive: true,
									onAction: () => setResetSettingsModalOpen(true)
								}
							]}
						/>
					</>
				)}
				{resetSettingsModalOpen && (
					<ResetSettingsModal
						onSuccess={handleResetSettingsSuccess}
						onClose={() => setResetSettingsModalOpen(false)}
					/>
				)}
			</Page>
		</SettingsLayoutContext.Provider>
	)
}
