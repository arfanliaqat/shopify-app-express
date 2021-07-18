import React, { useEffect } from "react"
import { useAppBridge } from "@shopify/app-bridge-react"
import { useApi } from "./useApi"

const Beacon: any | undefined = (window as any).Beacon

interface HelpScoutInfo {
	name?: string
	email?: string
	signature?: string
}

export default function HelpScoutBeacon() {
	const app = useAppBridge()
	const { setApiRequest: loadHelpScoutInfo, data: helpScoutInfo } = useApi<HelpScoutInfo>({}, app)

	useEffect(() => {
		if (Beacon) {
			loadHelpScoutInfo({ url: "/help_scout_info" })
		}
	}, [])

	useEffect(() => {
		if (Beacon && helpScoutInfo) {
			Beacon("identify", helpScoutInfo)
		}
	}, [helpScoutInfo])

	return null
}
