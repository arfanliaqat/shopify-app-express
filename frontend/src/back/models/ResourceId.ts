export default interface ResourceId {
	type: string
	id: number
}

export function parseResourceId(gid: string): ResourceId {
	const [a, type, id] = /(\w+)\/(\d+)$/.exec(gid)
	return { type, id: parseInt(id) }
}
