import React, { useState } from "react"
import { Button, Tag } from "@shopify/polaris"
import { ActionVerb, ResourceSelection } from "@shopify/app-bridge/actions/ResourcePicker"
import { SelectPayload } from "@shopify/app-bridge-react/components/ResourcePicker/ResourcePicker"
import { ResourcePicker } from "@shopify/app-bridge-react"
import _ from "lodash"
import { Collection } from "../../../widget/src/models/WidgetSettings"

interface Props {
	collections: Collection[]
	onChange: (collections: Collection[]) => void
}

export default function CollectionPicker({ collections, onChange }: Props) {
	const [pickerOpen, setPickerOpen] = useState<boolean>(false)

	const handleRemove = (collection: Collection) => () => {
		const collectionsCopy = [...collections]
		const index = collectionsCopy.findIndex((d) => d.id == collection.id)
		collectionsCopy.splice(index, 1)
		onChange(collectionsCopy)
	}

	const handleCollectionsSelected = (selectPayload: SelectPayload) => {
		const newCollections = selectPayload.selection.map((selection: ResourceSelection) => {
			const idPos = selection.id.lastIndexOf("/")
			const strCollectionId = selection.id.substring(idPos + 1)
			return {
				id: parseInt(strCollectionId),
				title: selection.title
			} as Collection
		})
		const collectionsCopy = [...collections]
		newCollections.forEach((collection) => {
			const existingCollection = collectionsCopy.find((col) => col.id == collection.id)
			if (!existingCollection) {
				collectionsCopy.push(collection)
			}
		})
		onChange(_.sortBy(collectionsCopy, (c) => c.title.toLowerCase()))
	}

	return (
		<>
			<ResourcePicker
				key="modal"
				actionVerb={ActionVerb.Select}
				resourceType="Collection"
				allowMultiple
				open={pickerOpen}
				onSelection={handleCollectionsSelected}
				onCancel={() => setPickerOpen(false)}
			/>
			<div className="tagsField">
				<div className="fieldLabel">Collections</div>
				<div className="tags">
					{collections.map((collection, index) => {
						return (
							<Tag key={index} onRemove={handleRemove(collection)}>
								{collection.title}
							</Tag>
						)
					})}
					{collections.length == 0 && <em>No collections defined yet</em>}
				</div>
				<Button onClick={() => setPickerOpen(!pickerOpen)}>Add collections</Button>
			</div>
		</>
	)
}
