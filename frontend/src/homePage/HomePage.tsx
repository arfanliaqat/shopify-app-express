import React, { useState, useEffect, useCallback } from "react"
import { Page, Card, ResourceList, Button } from "@shopify/polaris"
import moment from "moment"
import { useApi } from "../util/useApi"
import { ShopResource } from "../models/ShopResource"
import AddResourceModal from "./AddResourceModal"
import { RouteChildrenProps } from "react-router"
import ProductItem from "./ProductItem"
import HomePageSkeleton from "./HomePageSkeleton"

interface ShopResourcesPageResult {
	results: ShopResource[]
	hasMore: boolean
}

export default function HomePage({ history }: RouteChildrenProps) {
	const [open, setOpen] = useState<boolean>(false)
	const [page, setPage] = useState<number>(0)
	const [shopResources, setShopResources] = useState<ShopResource[]>([])
	const { setApiRequest, data: pageResult, isLoading } = useApi<ShopResourcesPageResult>({
		onSuccess: (pageResult) => {
			setShopResources(shopResources.concat(pageResult.results?.map(ShopResource.create) || []))
		}
	})

	const fetchShopResources = useCallback(() => {
		setApiRequest({
			url: `/resources`,
			queryParams: { page }
		})
		setOpen(false)
	}, [setApiRequest, page])

	useEffect(() => {
		fetchShopResources()
	}, [fetchShopResources])

	const onShopResourceClick = useCallback(
		(shopResource: ShopResource) => () => {
			history.push(`/app/resources/${shopResource.id}/calendar/${moment().format("YYYY/MM")}`)
		},
		[history]
	)

	if (pageResult === undefined) {
		return <HomePageSkeleton />
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
						loading={isLoading}
						renderItem={(shopResource) => (
							<ProductItem shopResource={shopResource} onClick={onShopResourceClick(shopResource)} />
						)}
					/>
					{pageResult.hasMore && (
						<div className="productListFooter">
							<Button onClick={() => setPage(page + 1)}>Show more</Button>
						</div>
					)}
				</Card>
			</Page>
		</div>
	)
}
