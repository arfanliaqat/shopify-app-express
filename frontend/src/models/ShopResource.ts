type AvailabilityStatus = "AVAILABLE" | "SOLD_OUT" | "NOT_AVAILABLE"

const messages: any = {
	AVAILABLE: "Available",
	SOLD_OUT: "Sold out",
	NOT_AVAILABLE: "Not available"
}

export function getAvailabilityStatusMessage(status: AvailabilityStatus) {
	return messages[status]
}

export class ShopResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		public id: string,
		public resourceType: string,
		public resourceId: number,
		public title: string,
		public imageUrl: string | undefined,
		public nextAvailabilityDate?: string,
		public lastAvailabilityDate?: string,
		public availableDates?: number,
		public soldOutDates?: number
	) {}

	static create(rawShopResource: ShopResource) {
		return new ShopResource(
			rawShopResource.id,
			rawShopResource.resourceType,
			rawShopResource.resourceId,
			rawShopResource.title,
			rawShopResource.imageUrl,
			rawShopResource.nextAvailabilityDate,
			rawShopResource.lastAvailabilityDate,
			rawShopResource.availableDates,
			rawShopResource.soldOutDates
		)
	}

	getAvailabilityStatus(): AvailabilityStatus {
		if (this.soldOutDates !== undefined && this.soldOutDates > 0 && this.availableDates == 0) return "SOLD_OUT"
		if (this.availableDates !== undefined && this.availableDates > 0) return "AVAILABLE"
		return "NOT_AVAILABLE"
	}
}
