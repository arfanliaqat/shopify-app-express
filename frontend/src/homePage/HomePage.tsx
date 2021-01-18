import React, { useState, useEffect, useCallback } from "react"
import { Page, Card, ResourceList, Button, Tabs } from "@shopify/polaris"
import moment from "moment"
import { useApi } from "../util/useApi"
import { ShopResource } from "../models/ShopResource"
import AddResourceModal from "./AddResourceModal"
import { RouteChildrenProps } from "react-router"
import ProductItem from "./ProductItem"
import HomePageSkeleton from "./HomePageSkeleton"
import { TabDescriptor } from "@shopify/polaris/dist/types/latest/src/components/Tabs/types"

const tabs: TabDescriptor[] = [
	{
		id: "all",
		content: "All"
	},
	{
		id: "available",
		content: "Available"
	},
	{
		id: "notAvailable",
		content: "Not available"
	},
	{
		id: "soldOut",
		content: "Sold out"
	}
]

interface ShopResourcesPageResult {
	results: ShopResource[]
	hasMore: boolean
}

export default function HomePage({ history }: RouteChildrenProps) {
	const [open, setOpen] = useState(false)
	const [page, setPage] = useState(0)
	const [filterTabIndex, setFilterTabIndex] = useState(0)
	const [shopResources, setShopResources] = useState<ShopResource[]>([])
	const { setApiRequest, data: pageResult, isLoading } = useApi<ShopResourcesPageResult>({
		onSuccess: (pageResult) => {
			const newShopResources = pageResult.results?.map(ShopResource.create)
			if (page > 0) {
				setShopResources(shopResources.concat(newShopResources))
			} else {
				setShopResources(newShopResources)
			}
		}
	})

	const fetchShopResources = useCallback(() => {
		setApiRequest({
			url: `/resources`,
			queryParams: { page, status: tabs[filterTabIndex].id }
		})
		setOpen(false)
	}, [setApiRequest, page, filterTabIndex])

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

	const handleTabSelected = (index: number): void => {
		setFilterTabIndex(index)
		setPage(0)
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
					<Tabs tabs={tabs} selected={filterTabIndex} onSelect={handleTabSelected} />
					<ResourceList
						items={shopResources}
						loading={isLoading}
						renderItem={(shopResource) => (
							<ProductItem shopResource={shopResource} onClick={onShopResourceClick(shopResource)} />
						)}
						emptyState={<div className="noResults">No results found</div>}
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
