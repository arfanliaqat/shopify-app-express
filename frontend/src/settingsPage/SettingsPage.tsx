import React, { useState } from "react"
import { Layout, Page, Card, FormLayout, TextField } from "@shopify/polaris"

interface Props {}

export default function SettingsPage({}: Props) {
	const [availabilityCutOff, setAvailabilityCutOff] = useState(1)
	const [recurringAvailabilityCutOff, setRecurringAvailabilityCutOff] = useState(12)
	return (
		<Page breadcrumbs={[{ content: "Products", url: "/app" }]} title="Settings">
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
		</Page>
	)
}
