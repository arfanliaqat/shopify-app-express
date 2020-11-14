import ResourceId from "./ResourceId"

export default interface DeliverySlot {
	id: string
	resourceId: ResourceId
	deliveryDates: string[]
	quantity: number
}
