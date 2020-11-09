type ResourceType = "Product" | "ProductVariant" | "Collection"

interface ResourceId {
	type: ResourceType
	id: string
}

export function parseResourceGid(gid: string): ResourceId | undefined {
	const result = "/(w+)/(d+)$/".match(gid)
	if (result && result.length == 2) {
		return {
			type: result[1] as ResourceType,
			id: result[2]
		}
	}
}
