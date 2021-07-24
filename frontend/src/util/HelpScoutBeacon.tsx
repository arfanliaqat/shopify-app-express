import React, { useEffect } from "react"
import { useAppBridge } from "@shopify/app-bridge-react"
import { useApi } from "./useApi"

interface HelpScoutInfo {
	name?: string
	email?: string
	signature?: string
}

export default function HelpScoutBeacon() {
	const app = useAppBridge()
	const { setApiRequest: loadHelpScoutInfo, data: helpScoutInfo } = useApi<HelpScoutInfo>({}, app)

	useEffect(() => {
		if ((window as any).Beacon) {
			loadHelpScoutInfo({ url: "/help_scout_info" })
		}
	}, [])

	useEffect(() => {
		const beacon = (window as any).Beacon
		if (beacon && helpScoutInfo) {
			beacon("identify", helpScoutInfo)
		}
	}, [helpScoutInfo])

	return null
}
