import React from "react"
import { ResourceList, Icon } from "@shopify/polaris"
import { getAvailabilityStatusMessage, ShopResource } from "../models/ShopResource"
import moment from "moment"
import { SHORT_DISPLAY_FORMAT, SYSTEM_DATE_FORMAT } from "../../../backend/src/util/constants"
import { ImageMajorTwotone } from "@shopify/polaris-icons"
import ProductThumbnail from "../util/ProductThumbnail"

function formatDate(strDate: string): string {
	return moment(strDate, SYSTEM_DATE_FORMAT).format(SHORT_DISPLAY_FORMAT)
}

interface Props {
	shopResource: ShopResource
	onClick: () => void
}

export default function ProductItem({ shopResource, onClick }: Props) {
	const availabilityStatus = shopResource.getAvailabilityStatus()
	return (
		<ResourceList.Item id={`product${shopResource.title}`} onClick={onClick}>
			<div className="productItem">
				<div className="left">
					<ProductThumbnail src={shopResource.imageUrl} />
				</div>
				<div className="right">
					<div className="productTitle">{shopResource.title}</div>
					<div className="productProperties">
						<div className="nextAvailableDate">
							<div className="title">Next available date</div>
							<div className="value">
								{shopResource.nextAvailabilityDate
									? formatDate(shopResource.nextAvailabilityDate)
									: "n/a"}
							</div>
						</div>
						<div className="lastAvailableDate">
							<div className="title">Last available date</div>
							<div className="value">
								{shopResource.lastAvailabilityDate
									? formatDate(shopResource.lastAvailabilityDate)
									: "n/a"}
							</div>
						</div>
						<div className="soldOutDates">
							<div className="title">Sold out dates</div>
							<div className="value">
								{shopResource.nextAvailabilityDate ? shopResource.soldOutDates || 0 : "n/a"}
							</div>
						</div>
						<div className="availableDates">
							<div className="title">Available dates</div>
							<div className="value">
								{shopResource.nextAvailabilityDate ? shopResource.availableDates || 0 : "n/a"}
							</div>
						</div>
						<div className={`status ${availabilityStatus}`}>
							{getAvailabilityStatusMessage(availabilityStatus)}
						</div>
					</div>
				</div>
			</div>
		</ResourceList.Item>
	)
}
