import React, { useState } from "react"
import { Layout, Page, Card, FormLayout, TextField, Select, SelectOption, Checkbox } from "@shopify/polaris"
import { PickerType, WidgetStyles } from "../../../widget/src/models/WidgetSettings"

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

export default function SettingsPage({}: Props) {
	const [availabilityCutOff, setAvailabilityCutOff] = useState(1)
	const [recurringAvailabilityCutOff, setRecurringAvailabilityCutOff] = useState(12)
	const [datePickerType, setDatePickerType] = useState<PickerType>("CALENDAR")
	const [language, setLanguage] = useState("en")
	const [theme, setTheme] = useState("en")
	const [withShadow, setWithShadow] = useState(true)
	const [boldHeaderDays, setBoldHeaderDays] = useState(true)
	const [widgetStyles, setWidgetStyles] = useState<WidgetStyles>(undefined)

	const handleWidgetStyleChange = (key: keyof WidgetStyles) => (value: string) => {
		const newWidgetStyles = { ...widgetStyles }
		newWidgetStyles[key] = value
		setWidgetStyles(widgetStyles)
	}

	return (
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
											value={datePickerType}
											onChange={(value) => setDatePickerType(value as PickerType)}
										/>

										<Select
											label="Type"
											options={datePickerLanguages}
											value={language}
											onChange={(value) => setLanguage(value)}
										/>
									</FormLayout.Group>

									<FormLayout.Group>
										<TextField
											label="Error font color"
											onChange={handleWidgetStyleChange("errorFontColor")}
											value={widgetStyles?.errorFontColor}
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
											value={theme}
											onChange={(value) => setTheme(value)}
										/>

										<Checkbox
											label="With shadow around the box"
											checked={withShadow}
											onChange={(checked) => setWithShadow(checked)}
										/>
									</FormLayout.Group>

									<FormLayout.Group>
										<TextField
											label="Calendar background color"
											onChange={handleWidgetStyleChange("calendarBackgroundColor")}
											value={widgetStyles?.calendarBackgroundColor}
										/>

										<TextField
											label="Header font color"
											onChange={handleWidgetStyleChange("headerFontColor")}
											value={widgetStyles?.headerFontColor}
										/>
									</FormLayout.Group>

									<FormLayout.Group>
										<TextField
											label="Days (header) font color"
											onChange={handleWidgetStyleChange("headerDaysFontColor")}
											value={widgetStyles?.headerDaysFontColor}
										/>

										<Checkbox
											label="Bold days (header)"
											checked={boldHeaderDays}
											onChange={(checked) => setBoldHeaderDays(checked)}
										/>
									</FormLayout.Group>

									<FormLayout.Group>
										<TextField
											label="Unavailable day font color"
											onChange={handleWidgetStyleChange("dayUnavailableFontColor")}
											value={widgetStyles?.dayUnavailableFontColor}
										/>
										<TextField
											label="Available day font color"
											onChange={handleWidgetStyleChange("dayAvailableFontColor")}
											value={widgetStyles?.dayAvailableFontColor}
										/>
									</FormLayout.Group>

									<FormLayout.Group>
										<TextField
											label="Day selected background color"
											onChange={handleWidgetStyleChange("daySelectedBackgroundColor")}
											value={widgetStyles?.daySelectedBackgroundColor}
										/>
										<TextField
											label="Day selected font color"
											onChange={handleWidgetStyleChange("daySelectedFontColor")}
											value={widgetStyles?.daySelectedFontColor}
										/>
									</FormLayout.Group>
								</FormLayout>
							</Card>
						</Layout.Section>
					</Layout>
				</Layout.Section>
				<Layout.Section secondary>
					<Card>
						<Card.Section>
							<div className="Polaris-Heading">Preview</div>
						</Card.Section>
						<Card.Section>
							<div className="h10-stock-by-date" />
						</Card.Section>
						<Card.Section>
							<TextField
								label="Preview background color"
								onChange={handleWidgetStyleChange("previewBackgroundColor")}
								value={widgetStyles?.previewBackgroundColor}
							/>
						</Card.Section>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	)
}
