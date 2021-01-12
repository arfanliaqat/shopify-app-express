import React, { useState, useEffect, useCallback } from "react"
import { Page, Card, Spinner, ResourceList } from "@shopify/polaris"
import moment from "moment"
import { useApi } from "../util/useApi"
import ShopResource from "../models/ShopResource"
import AddResourceModal from "./AddResourceModal"
import { RouteChildrenProps } from "react-router"
import ProductItem from "./ProductItem"

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
								<ProductItem shopResource={shopResource} onClick={onShopResourceClick(shopResource)} />
							)}
						/>
					</Card>
				)}
			</Page>
		</div>
	)
}
