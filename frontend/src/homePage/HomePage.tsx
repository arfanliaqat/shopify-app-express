import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Page, Card, ResourceList, SkeletonPage, SkeletonBodyText } from "@shopify/polaris"
import moment from "moment"
import { useApi } from "../util/useApi"
import { ShopResource } from "../models/ShopResource"
import AddResourceModal from "./AddResourceModal"
import { RouteChildrenProps } from "react-router"
import ProductItem from "./ProductItem"

export default function HomePage({ history }: RouteChildrenProps) {
	const [open, setOpen] = useState<boolean>(false)
	const { setApiRequest, data: rawShopResources, isLoading } = useApi<ShopResource[]>({})

	const shopResources = useMemo(() => rawShopResources?.map(ShopResource.create), [rawShopResources])

	const fetchShopResources = useCallback(() => {
		setApiRequest({ url: `/resources` })
		setOpen(false)
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

	if (isLoading || shopResources === undefined) {
		return (
			<div id="homePage">
				<SkeletonPage title="Products" primaryAction>
					<Card>
						{Array.from({ length: 5 }).map((val, index) => (
							<Card.Section key={index}>
								<SkeletonBodyText lines={3} />
							</Card.Section>
						))}
					</Card>
				</SkeletonPage>
			</div>
		)
	}

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
				<Card>
					<ResourceList
						items={shopResources}
						renderItem={(shopResource) => (
							<ProductItem shopResource={shopResource} onClick={onShopResourceClick(shopResource)} />
						)}
					/>
				</Card>
			</Page>
		</div>
	)
}
