import ResourceId from "./ResourceId"

export default interface DeliverySlot {
	id: number
	resourceId: ResourceId
	deliveryDates: string[]
	size: number
}
