import React, { useState, useEffect, useCallback } from "react"
import { ResourcePicker } from "@shopify/app-bridge-react"
import { ActionVerb } from "@shopify/app-bridge/actions/ResourcePicker"
import { SelectPayload } from "@shopify/app-bridge-react/components/ResourcePicker/ResourcePicker"
import { ResourcePicker as AppBridgeResourcePicker } from "@shopify/app-bridge/actions"
import { useApi } from "../util/useApi"

interface Props {
	open: boolean
	onClose: () => void
	onSuccess: () => void
}

export default function AddResourceModal({ open, onSuccess, onClose }: Props) {
	const [resourceSelection, setResourceSelection] = useState<AppBridgeResourcePicker.ResourceSelection[]>()
	const { setApiRequest: createShopResources } = useApi({
		onSuccess: useCallback(() => {
			onSuccess()
		}, [])
	})

	useEffect(() => {
		if (resourceSelection) {
			createShopResources({
				method: "POST",
				url: "/resources",
				postData: {
					resourceIds: resourceSelection.map((resource) => resource.id)
				}
			})
		}
	}, [resourceSelection])

	return (
		<ResourcePicker
			key="modal"
			actionVerb={ActionVerb.Select}
			resourceType="Product"
			showVariants={false}
			allowMultiple
			open={open}
			onSelection={(selectPayload: SelectPayload) => {
				setResourceSelection(selectPayload.selection)
			}}
			onCancel={() => onClose()}
		/>
	)
}
