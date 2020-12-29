import { getSubscribedHooks, LineItem, OrderEventData, OrderEventType, Property, Webhook } from "./hooks.model"
import { Shop } from "../shop/shop.model"
import { ProductOrderServiceWithTransaction } from "../productOrders/productOrders.service"
import { ProductOrder } from "../productOrders/productOrders.model"
import { ShopResourceService } from "../shopResource/shopResource.service"
import moment, { Moment } from "moment"
import { TAG_DATE_FORMAT, TAG_LABEL } from "../util/constants"
import axios from "axios"
import { handleAxiosErrors } from "../util/error"
import { AccessToken } from "../accessToken/accessToken.model"

export function getChosenDate(lineItem: LineItem): Moment | undefined {
	const chosenDateProperty = lineItem.properties.find((property: Property) => {
		return property.name?.toLowerCase() == TAG_LABEL.toLowerCase()
	})
	if (!chosenDateProperty?.value) return undefined
	return moment(chosenDateProperty.value, TAG_DATE_FORMAT)
}

export class HooksService {
	static async fetchAllHooks(shop: Shop, accessToken: AccessToken): Promise<Webhook[] | undefined> {
		try {
			return (
				await axios.get<{ webhooks: Webhook[] }>(`https://${shop.domain}/admin/api/2020-10/webhooks.json`, {
					headers: {
						"X-Shopify-Access-Token": accessToken.token
					}
				})
			).data.webhooks
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async subscribeHook(shop: Shop, accessToken: AccessToken, webhook: Webhook): Promise<void> {
		try {
			console.log(`[subscribeHook|shop:${shop.domain}] Subscribe ${webhook.topic}, ${webhook.address}...`)
			return await axios.post(
				`https://${shop.domain}/admin/api/2020-10/webhooks.json`,
				{ webhook },
				{
					headers: {
						"X-Shopify-Access-Token": accessToken.token
					}
				}
			)
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async deleteHook(shop: Shop, accessToken: AccessToken, webhook: Webhook): Promise<void> {
		try {
			console.log(`[deleteHook|shop:${shop.domain}] Delete ${webhook.topic}, ${webhook.address}...`)
			return await axios.delete(`https://${shop.domain}/admin/api/2020-10/webhooks/${webhook.id}.json`, {
				headers: {
					"X-Shopify-Access-Token": accessToken.token
				}
			})
		} catch (error) {
			handleAxiosErrors(error)
		}
	}

	static async deleteAllHooks(shop: Shop, accessToken: AccessToken): Promise<void> {
		const currentWebhooks = (await this.fetchAllHooks(shop, accessToken)) || []
		await currentWebhooks.forEach((webhook) => this.deleteHook(shop, accessToken, webhook))
	}

	static async subscribeHooks(shop: Shop, accessToken: AccessToken): Promise<void> {
		console.log(`[subscribeHooks|shop:${shop.domain}] Synchronising hooks...`)
		const currentWebhooks = (await this.fetchAllHooks(shop, accessToken)) || []
		const webhooksToCreate = getSubscribedHooks().filter((webhook) => {
			return !currentWebhooks.find(
				(currentWebhook) => currentWebhook.topic == webhook.topic && currentWebhook.address == webhook.address
			)
		})
		await webhooksToCreate.map(async (webhook) => {
			return this.subscribeHook(shop, accessToken, webhook)
		})
	}

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

			if (eventType == "cancelled" || eventType == "delete" || orderEvent.cancelled_at) {
				await service.commitTransaction()
				return
			}

			const productIds = Array.from(new Set<number>(orderEvent.line_items.map((item) => item.product_id)))
			const eventShopResourcesArray = await ShopResourceService.findByProductIds(productIds, service.getClient())
			const eventShopResources = ShopResourceService.groupByResourceId(eventShopResourcesArray)

			const newProductOrdersById: { [id: string]: ProductOrder } = {}

			orderEvent.line_items.forEach((item) => {
				const chosenDate = getChosenDate(item)
				if (!chosenDate) return
				const shopResource = eventShopResources[item.product_id]
				if (shopResource && shopResource.id) {
					const key = shopResource.id + ":" + chosenDate
					const newProductOrder = newProductOrdersById[key]
					if (!newProductOrder) {
						newProductOrdersById[key] = new ProductOrder(
							undefined,
							shopResource.id,
							orderEvent.id,
							chosenDate,
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
