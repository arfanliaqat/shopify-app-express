export interface Theme {
	id: number
	name: string
	created_at: string
	updated_at: string
	role: "main" | "unpublished" | "demo"
	theme_store_id: number | undefined
	previewable: boolean
	processing: boolean
	admin_graphql_api_id: string
}
