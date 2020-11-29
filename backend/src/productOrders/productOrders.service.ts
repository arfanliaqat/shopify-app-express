import Axios from "axios"
import { Moment } from "moment"
import { Shop } from "../shop/shop.model"
import { ShopResource } from "../shopResource/shopResource.model"
import { Order } from "./productOrders.model"

// async function fetchOrders(
// 	shop: Shop,
// 	shopResource: ShopResource,
// 	from: Moment,
// 	to: Moment
// ): Promise<Order[] | undefined> {
// 	try {
// 		const response = await Axios({
// 			method: "POST",
// 			url: `https://${shop.domain}/admin/api/graphql.json`,
// 			headers: {
// 				"Content-Type": "application/json",
// 				"X-Shopify-Access-Token": accessToken.token
// 			},
// 			data: {
// 				query: `{ product(id: "${productGid}") { id, title } }`
// 			}
// 		})
// 		return response.data.data.product as ShopifyResource
// 	} catch (error) {
// 		handleAxiosErrors(error)
// 	}
// }
