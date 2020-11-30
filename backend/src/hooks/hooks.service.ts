import { OrderEventData } from "./hooks.model"
import { Shop } from "../shop/shop.model"
import { ProductOrderServiceWithTransaction } from "../productOrders/productOrders.service"
import { ProductOrder } from "../productOrders/productOrders.model"
import { ShopResourceService } from "../shopResource/shopResource.service"
import moment, { Moment } from "moment"
import { Pool } from "pg"
import { getConnection } from "../util/database"

function logPrefix(orderEvent: OrderEventData) {
	return `[Order: ${orderEvent.id}]`
}

function getDeliveryDate(orderEvent: OrderEventData): Moment | undefined {
	if (!orderEvent.tags) return
	const matches = orderEvent.tags.match(/Delivery Date: ([^,$]+)/)
	if (!matches || !matches.length) return
	try {
		return moment(matches[1])
	} catch (error) {
		console.error(`${logPrefix(orderEvent)} ${error} (date: ${matches})`)
	}
}

export class HooksService {
	static async ingestOrderEvent(connectedShop: Shop, orderEvent: OrderEventData): Promise<void> {
		const service = new ProductOrderServiceWithTransaction()
		await service.beginTransaction()
		try {
			await service.deleteByOrderId(orderEvent.id)

			const deliveryDate = getDeliveryDate(orderEvent)
			if (!deliveryDate) {
				return // if no delivery can be extracted, no need to ingest
			}

			const productIds = new Set<number>(orderEvent.line_items.map((item) => item.product_id))
			const eventShopResources = await ShopResourceService.findByProductIds(Array.from(productIds))

			const newProductOrdersById: { [id: string]: ProductOrder } = {}

			orderEvent.line_items.forEach((item) => {
				const shopResource = eventShopResources[item.product_id]
				if (shopResource && shopResource.id) {
					const newProductOrder = newProductOrdersById[shopResource.id]
					if (!newProductOrder) {
						newProductOrdersById[shopResource.id] = new ProductOrder(
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
		} catch (e) {
			await service.rollbackTransaction()
			throw e
		}
		await service.commitTransaction()
	}
}
