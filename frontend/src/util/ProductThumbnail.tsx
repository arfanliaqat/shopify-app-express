import React from "react"
import { Icon } from "@shopify/polaris"
import { ImageMajorTwotone } from "@shopify/polaris-icons"

interface Props {
	src?: string
}

export default function ProductThumbnail({ src }: Props) {
	return (
		<div className="productThumbnail">
			{src && <div className="image" style={{ backgroundImage: `url(${src}` }} />}
			{!src && (
				<div className="image placeholder">
					<Icon source={ImageMajorTwotone} color="inkLightest" />
				</div>
			)}
		</div>
	)
}
