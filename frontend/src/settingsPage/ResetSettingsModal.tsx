import React, { useState } from "react"
import { Modal, TextContainer } from "@shopify/polaris"
import ModalBackground from "../util/ModalBackground"
import { useApi } from "../util/useApi"
import { WidgetSettings } from "../../../backend/src/widget/widget.model"

interface Props {
	onSuccess: (widgetSettings: WidgetSettings) => void
	onClose: () => void
}

export default function ResetSettingsModal({ onSuccess, onClose }: Props) {
	const [active, setActive] = useState(true)

	const { setApiRequest: resetSettings, isLoading } = useApi({
		onSuccess: (widgetSettings: WidgetSettings) => {
			onSuccess(widgetSettings)
		}
	})

	const handleResetSettingsClick = () => {
		resetSettings({
			method: "post",
			url: "/widget_settings/reset"
		})
	}
	const handleCloseClick = () => {
		setActive(false)
		onClose()
	}

	return (
		<ModalBackground onClose={handleCloseClick}>
			<Modal
				open={active}
				onClose={handleCloseClick}
				title="Reset the settings"
				primaryAction={{
					content: "Yes, reset the settings",
					destructive: true,
					loading: isLoading,
					onAction: handleResetSettingsClick
				}}
			>
				<Modal.Section>
					<TextContainer>
						<p>
							This will set all the widget preferences (like the calendar styles, language preferences,
							etc.) with the default settings.
						</p>
						<p>This cannot be undone. Do you really want to reset all the settings?</p>
					</TextContainer>
				</Modal.Section>
			</Modal>
		</ModalBackground>
	)
}
