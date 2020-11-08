interface ResourceCapacitySchema {
	id: string
	shop_resource_id: string
	capacity: number
	start_date: Date
	end_date: Date
	dates: string
	created_date?: Date
}

interface ResourceCapacity {
	id: string
	shopResourceId: string
	capacity: number
	startDate: Date
	endDate: Date
	dates: Date[]
	created_date?: Date
}

export function toResourceCapacity(schema: ResourceCapacitySchema): ResourceCapacity {
	return {
		id: schema.id,
		shopResourceId: schema.shop_resource_id,
		capacity: schema.capacity,
		startDate: schema.start_date,
		endDate: schema.end_date,
		dates: (JSON.parse(schema.dates) as string[]).map((strDate) => new Date(strDate)),
		created_date: schema.created_date
	}
}
