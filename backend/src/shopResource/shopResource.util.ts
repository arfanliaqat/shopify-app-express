type ResourceType = "Product" | "ProductVariant" | "Collection"

export interface ResourceId {
	type: ResourceType
	id: number
}

export function parseResourceGid(gid: string): ResourceId | undefined {
	const result = /(\w+)\/(\d+)$/.exec(gid)
	if (result && result.length == 3) {
		return {
			type: result[1] as ResourceType,
			id: parseInt(result[2])
		}
	}
}
