export interface Asset {
	key: string
	public_url?: string
	created_at: string
	updated_at: string
	content_type: string
	size?: number
	checksum?: string
	theme_id: 828155753
}

export interface PutAssetPayload {
	key: string
	value: string
}
