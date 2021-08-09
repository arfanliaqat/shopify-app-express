import React, { useState } from "react"
import { Button, TextField, Popover, Tag, FormLayout } from "@shopify/polaris"

interface Props {
	productTags: string[]
	onChange: (productTags: string[]) => void
}

export default function ProductTagPicker({ productTags, onChange }: Props) {
	const [open, setOpen] = useState<boolean>()
	const [tag, setTag] = useState<string>("")

	const handleAdd = () => {
		const productTagsCopy = [...productTags]
		productTagsCopy.push(tag)
		productTagsCopy.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		onChange(productTagsCopy)
		setOpen(false)
	}

	const handleRemove = (productTagToRemove: string) => () => {
		const productTagsCopy = [...productTags]
		const index = productTagsCopy.findIndex((t) => t == productTagToRemove)
		productTagsCopy.splice(index, 1)
		onChange(productTagsCopy)
	}

	const togglePopoverActive = () => {
		setOpen((active) => !active)
		setTag("")
	}

	return (
		<div className="tagsField">
			<div className="fieldLabel">Product tags</div>
			<div className="tags">
				{productTags.map((productTag, index) => {
					return (
						<Tag key={index} onRemove={handleRemove(productTag)}>
							{productTag}
						</Tag>
					)
				})}
				{productTags.length == 0 && <em>No product tags defined yet</em>}
			</div>
			<Popover
				activator={
					<Button onClick={togglePopoverActive} disclosure>
						Add product tag
					</Button>
				}
				active={open}
				onClose={() => setOpen(false)}
				preferredAlignment="left"
			>
				<div className="productTagHolder">
					<FormLayout>
						<TextField label="Product tag" value={tag} onChange={(value) => setTag(value)} />
						<Button onClick={handleAdd}>Add</Button>
					</FormLayout>
				</div>
			</Popover>
		</div>
	)
}
