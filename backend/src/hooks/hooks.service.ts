import { OrderEventData, OrderEventType } from "./hooks.model"
import { Shop } from "../shop/shop.model"
import { ProductOrderServiceWithTransaction } from "../productOrders/productOrders.service"
import { ProductOrder } from "../productOrders/productOrders.model"
import { ShopResourceService } from "../shopResource/shopResource.service"
import moment, { Moment } from "moment"
import { tagDateFormat } from "../util/constants"

function logPrefix(orderEvent: OrderEventData) {
	return `[Order: ${orderEvent.id}]`
}

function getDeliveryDate(orderEvent: OrderEventData): Moment | undefined {
	if (!orderEvent.tags) return
	const matches = orderEvent.tags.match(/Delivery Date: ([^,$]+)/)
	if (!matches || !matches.length) return
	try {
		return moment(matches[1], tagDateFormat)
	} catch (error) {
		console.error(`${logPrefix(orderEvent)} ${error} (date: ${matches})`)
	}
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

			const deliveryDate = getDeliveryDate(orderEvent)
			if (!deliveryDate) {
				// if no delivery date can be extracted
				await service.commitTransaction()
				return
			}

			const productIds = Array.from(new Set<number>(orderEvent.line_items.map((item) => item.product_id)))
			const eventShopResourcesArray = await ShopResourceService.findByProductIds(productIds, service.getClient())
			const eventShopResources = ShopResourceService.groupByResourceId(eventShopResourcesArray)

			const newProductOrdersById: { [id: string]: ProductOrder } = {}

			orderEvent.line_items.forEach((item) => {
				const shopResource = eventShopResources[item.product_id]
				if (shopResource && shopResource.id) {
					const newProductOrder = newProductOrdersById[shopResource.id]
					if (!newProductOrder) {
						newProductOrdersById[shopResource.id] = new ProductOrder(
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
