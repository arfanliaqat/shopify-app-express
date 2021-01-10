export default interface ShopResource {
	id: string
	resourceType: string
	resourceId: number
	title: string
	nextAvailabilityDate?: string
	lastAvailabilityDate?: string
	availableDates?: number
	soldOutDates?: number
}
