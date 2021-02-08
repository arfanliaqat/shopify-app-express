import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
	Layout,
	Page,
	Card,
	FormLayout,
	TextField,
	Select,
	SelectOption,
	Checkbox,
	PageActions
} from "@shopify/polaris"
import { WidgetSettings, PickerType, WidgetStyles } from "../../../widget/src/models/WidgetSettings"
import { useApi } from "../util/useApi"
import { Toast } from "@shopify/app-bridge-react"
import _ from "lodash"
import ResetSettingsModal from "./ResetSettingsModal"
import Preview from "./Preview"

interface Props {}

export const datePickerLanguages: SelectOption[] = [
	{ value: "nl", label: "Dutch" },
	{ value: "en", label: "English (United States)" },
	{ value: "en-au", label: "English (Australia)" },
	{ value: "en-ca", label: "English (Canada)" },
	{ value: "en-gb", label: "English (United Kingdom)" },
	{ value: "fr", label: "French" },
	{ value: "fr-ca", label: "French (Canada)" },
	{ value: "de", label: "German" },
	{ value: "id", label: "Indonesian" },
	{ value: "it", label: "Italian" },
	{ value: "pl", label: "Polish" },
	{ value: "pt", label: "Portuguese" },
	{ value: "pt-br", label: "Portuguese (Brazil)" },
	{ value: "ro", label: "Romanian" },
	{ value: "ru", label: "Russian" },
	{ value: "es", label: "Spanish" },
	{ value: "sv", label: "Swedish" }
]

const BOX_SHADOW = "0 0 5px rgba(0,0,0,0.15)"
const BOX_BORDER_RADIUS = "10px"
const HEADER_FONT_WEIGHT = "bold"

function getTheme(widgetSettings: WidgetSettings): string {
	if (widgetSettings.styles.calendarBorderRadius == BOX_BORDER_RADIUS) {
		return "ROUNDED"
	}
	return "SQUARED"
}

function getWithShadow(widgetSettings: WidgetSettings): boolean {
	return widgetSettings.styles.calendarBoxShadow == BOX_SHADOW
}

function getBoldHeaderDays(widgetSettings: WidgetSettings): boolean {
	return widgetSettings.styles.headerDaysFontWeight == HEADER_FONT_WEIGHT
}

export default function SettingsPage({}: Props) {
	const [availabilityCutOff, setAvailabilityCutOff] = useState(1)
	const [recurringAvailabilityCutOff, setRecurringAvailabilityCutOff] = useState(12)
	const [initialWidgetSettings, setInitialWidgetSettings] = useState<WidgetSettings>(undefined)
	const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(undefined)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [reloadIncrement, setReloadIncrement] = useState<number>(0)
	const [resetSettingsModalOpen, setResetSettingsModalOpen] = useState(false)

	const { setApiRequest: fetchPeriod, isLoading } = useApi<WidgetSettings>({
		onSuccess: useCallback((widgetSettings) => {
			setInitialWidgetSettings({ ...widgetSettings })
			setWidgetSettings({ ...widgetSettings })
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

	const handleDatePickerTypeChange = (pickerType: PickerType) => {
		setWidgetSettings({ ...widgetSettings, pickerType })
	}

	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const styles: WidgetStyles = { ...widgetSettings.styles, [key]: value }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	const handleWithShadowChange = (checked: boolean) => {
		const styles = { ...widgetSettings.styles, calendarBoxShadow: checked ? BOX_SHADOW : "" }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	const handleBoldHeaderDaysChange = (checked: boolean) => {
		const styles = { ...widgetSettings.styles, headerDaysFontWeight: checked ? HEADER_FONT_WEIGHT : "" }
		setWidgetSettings({ ...widgetSettings, styles })
	}

	const handleLanguageChange = (locale: string) => {
		setWidgetSettings({ ...widgetSettings, locale })
	}

	const handleThemeChange = (theme: string) => {
		const styles = { ...widgetSettings.styles, calendarBorderRadius: theme == "ROUNDED" ? BOX_BORDER_RADIUS : "" }
		setWidgetSettings({ ...widgetSettings, styles })
	}

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
		return "Loading..."
	}

	return (
		<div id="settingsPage">
			{successMessage && <Toast content={successMessage} onDismiss={() => setSuccessMessage(undefined)} />}
			<Page breadcrumbs={[{ content: "Products", url: "/app" }]} title="Settings" separator>
				<Layout>
					<Layout.Section>
						<Card title="Availability settings" sectioned>
							<FormLayout>
								<TextField
									type="number"
									label="Availability cut off"
									onChange={(value) => setAvailabilityCutOff(parseInt(value))}
									suffix="days"
									value={availabilityCutOff + ""}
									min={0}
									max={19}
									helpText={`
									For example, if the next available date is the Feb 20, on Feb ${20 - availabilityCutOff - 2} the date
									will still be available in the date picker, but on Feb ${20 - availabilityCutOff - 1} it won’t be any more.`}
								/>

								<TextField
									type="number"
									label="Recurring availability generation cut off"
									onChange={(value) => setRecurringAvailabilityCutOff(parseInt(value))}
									suffix="weeks"
									value={recurringAvailabilityCutOff + ""}
									min={0}
									max={20}
									helpText={`
									When using the recurring availability feature, our system will generate availability
									dates up to ${recurringAvailabilityCutOff} weeks in advance.`}
								/>
							</FormLayout>
						</Card>
					</Layout.Section>
				</Layout>
				<div className="pageSeparator" />
				<Layout>
					<Layout.Section>
						<Layout>
							<Layout.Section>
								<Card title="Date picker settings" sectioned>
									<FormLayout>
										<FormLayout.Group>
											<Select
												label="Type"
												options={[
													{ value: "CALENDAR", label: "Calendar" },
													{ value: "DROPDOWN", label: "Dropdown" }
												]}
												value={widgetSettings.pickerType}
												onChange={handleDatePickerTypeChange}
											/>

											<Select
												label="Calendar language & date format"
												options={datePickerLanguages}
												value={widgetSettings.locale}
												onChange={(value) => handleLanguageChange(value)}
											/>
										</FormLayout.Group>

										<FormLayout.Group>
											<TextField
												label="Error font color"
												onChange={handleWidgetStyleChange("errorFontColor")}
												value={widgetSettings.styles.errorFontColor}
											/>
										</FormLayout.Group>
									</FormLayout>
								</Card>
							</Layout.Section>

							<Layout.Section>
								<Card title="Calendar style" sectioned>
									<FormLayout>
										<FormLayout.Group>
											<Select
												label="Theme"
												options={[
													{ value: "ROUNDED", label: "Rounded" },
													{ value: "SQUARED", label: "Squared" }
												]}
												value={getTheme(widgetSettings)}
												onChange={handleThemeChange}
											/>

											<Checkbox
												label="With shadow around the box"
												checked={getWithShadow(widgetSettings)}
												onChange={handleWithShadowChange}
											/>
										</FormLayout.Group>

										<FormLayout.Group>
											<TextField
												label="Calendar background color"
												onChange={handleWidgetStyleChange("calendarBackgroundColor")}
												value={widgetSettings.styles.calendarBackgroundColor}
											/>

											<TextField
												label="Header font color"
												onChange={handleWidgetStyleChange("headerFontColor")}
												value={widgetSettings.styles.headerFontColor}
											/>
										</FormLayout.Group>

										<FormLayout.Group>
											<TextField
												label="Days (header) font color"
												onChange={handleWidgetStyleChange("headerDaysFontColor")}
												value={widgetSettings.styles.headerDaysFontColor}
											/>

											<Checkbox
												label="Bold days (header)"
												checked={getBoldHeaderDays(widgetSettings)}
												onChange={handleBoldHeaderDaysChange}
											/>
										</FormLayout.Group>

										<FormLayout.Group>
											<TextField
												label="Unavailable day font color"
												onChange={handleWidgetStyleChange("dayUnavailableFontColor")}
												value={widgetSettings.styles.dayUnavailableFontColor}
											/>
											<TextField
												label="Available day font color"
												onChange={handleWidgetStyleChange("dayAvailableFontColor")}
												value={widgetSettings.styles.dayAvailableFontColor}
											/>
										</FormLayout.Group>

										<FormLayout.Group>
											<TextField
												label="Day selected background color"
												onChange={handleWidgetStyleChange("daySelectedBackgroundColor")}
												value={widgetSettings.styles.daySelectedBackgroundColor}
											/>
											<TextField
												label="Day selected font color"
												onChange={handleWidgetStyleChange("daySelectedFontColor")}
												value={widgetSettings.styles.daySelectedFontColor}
											/>
										</FormLayout.Group>

										<FormLayout.Group>
											<TextField
												label="Next/prev. arrows color"
												onChange={handleWidgetStyleChange("arrowIconColor")}
												value={widgetSettings.styles.arrowIconColor}
											/>
										</FormLayout.Group>
									</FormLayout>
								</Card>
							</Layout.Section>
						</Layout>
					</Layout.Section>
					<Layout.Section oneThird>
						<div className="previewCard">
							<Card>
								<Card.Section>
									<div className="Polaris-Heading">Preview</div>
								</Card.Section>
								<Card.Section>
									<Preview widgetSettings={widgetSettings} />
								</Card.Section>
								<Card.Section>
									<TextField
										label="Preview background color"
										onChange={handleWidgetStyleChange("previewBackgroundColor")}
										value={widgetSettings.styles.previewBackgroundColor}
									/>
								</Card.Section>
							</Card>
						</div>
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
