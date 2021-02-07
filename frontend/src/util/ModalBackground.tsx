import React from "react"
import _ from "lodash"

interface Props {
	children: any
	onClose: () => void
}

export default function ModalBackground({ children, onClose }: Props) {
	return (
		<div
			onMouseDown={(e) => {
				const className = (e.target as any).className || ""
				if (_.isString(className) && className.includes("Polaris-Modal-Dialog")) {
					e.preventDefault()
					onClose()
				}
			}}
		>
			{children}
		</div>
	)
}
