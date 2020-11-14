import React, { useState, useEffect, useCallback } from "react"
import { Page, Card, Spinner, ResourceList } from "@shopify/polaris"
import moment from "moment"
import { useApi } from "../util/useApi"
import { ShopResource } from "../models/ShopResource"
import AddResourceModal from "./AddResourceModal"
import { RouteChildrenProps } from "react-router"

export default function HomePage({ history }: RouteChildrenProps) {
	const [open, setOpen] = useState<boolean>(false)
	const { setApiRequest, data: shopResources, isLoading } = useApi<ShopResource[]>({})

	const fetchShopResources = useCallback(() => {
		setApiRequest({ url: `/resources` })
	}, [setApiRequest])

	useEffect(() => {
		fetchShopResources()
	}, [fetchShopResources])

	const onShopResourceClick = useCallback(
		(shopResource: ShopResource) => () => {
			history.push(`/app/resources/${shopResource.id}/calendar/${moment().format("YYYY/MM")}`)
		},
		[history]
	)

	return (
		<div id="homePage">
			<AddResourceModal open={open} onSuccess={() => fetchShopResources()} onClose={() => setOpen(false)} />
			<Page
				title="Products"
				primaryAction={{
					content: "Add products",
					onAction: () => setOpen(true)
				}}
			>
				{isLoading || shopResources === undefined ? (
					<Card>
						<Spinner />
					</Card>
				) : (
					<Card>
						<ResourceList
							items={shopResources}
							renderItem={(shopResource) => (
								<ResourceList.Item id="product" onClick={onShopResourceClick(shopResource)}>
									<div className="shopResourceTitle">{shopResource.title}</div>
								</ResourceList.Item>
							)}
						/>
					</Card>
				)}
			</Page>
		</div>
	)
}
