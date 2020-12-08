import { LineItem, OrderEventData, OrderEventType, Property } from "./hooks.model"
import { Shop } from "../shop/shop.model"
import { ProductOrderServiceWithTransaction } from "../productOrders/productOrders.service"
import { ProductOrder } from "../productOrders/productOrders.model"
import { ShopResourceService } from "../shopResource/shopResource.service"
import moment, { Moment } from "moment"
import { TAG_DATE_FORMAT } from "../util/constants"

function logPrefix(orderEvent: OrderEventData) {
	return `[Order: ${orderEvent.id}]`
}

function getDeliveryDate(lineItem: LineItem): Moment | undefined {
	const deliveryDateProperty = lineItem.properties.find((property: Property) => {
		return property.name?.toLowerCase() == "delivery date"
	})
	if (!deliveryDateProperty?.value) return undefined
	return moment(deliveryDateProperty.value, TAG_DATE_FORMAT)
}

export class HooksService {
	static async ingestOrderEvent(
		eventType: OrderEventType,
		connectedShop: Shop,
		orderEvent: OrderEventData
	): Promise<void> {
		const service = new ProductOrderServiceWithTransaction()
		await service.initClient()
		await service.beginTransaction()
		try {
			await service.deleteByOrderId(orderEvent.id)

			if (eventType == "cancellation" || eventType == "deletion" || orderEvent.cancelled_at) {
				await service.commitTransaction()
				return
			}

			const productIds = Array.from(new Set<number>(orderEvent.line_items.map((item) => item.product_id)))
			const eventShopResourcesArray = await ShopResourceService.findByProductIds(productIds, service.getClient())
			const eventShopResources = ShopResourceService.groupByResourceId(eventShopResourcesArray)

			const newProductOrdersById: { [id: string]: ProductOrder } = {}

			orderEvent.line_items.forEach((item) => {
				const deliveryDate = getDeliveryDate(item)
				if (!deliveryDate) return
				const shopResource = eventShopResources[item.product_id]
				if (shopResource && shopResource.id) {
					const key = shopResource + ":" + deliveryDate
					const newProductOrder = newProductOrdersById[key]
					if (!newProductOrder) {
						newProductOrdersById[key] = new ProductOrder(
							undefined,
							shopResource.id,
							orderEvent.id,
							deliveryDate,
							item.quantity
						)
					} else {
						newProductOrder.quantity += item.quantity
					}
				}
			})

			Object.values(newProductOrdersById).map(async (productOrder) => {
				await service.insert(productOrder)
			})

			await service.commitTransaction()
		} catch (e) {
			await service.rollbackTransaction()
			throw e
		} finally {
			service.releaseClient()
		}
	}
}
