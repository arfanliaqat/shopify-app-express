import { GdprPayload, GdprRequest, GdprRequestType } from "./gdpr.model"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { ShopSchema } from "../shop/shop.model"
import { ShopService } from "../shop/shop.service"

export class GdprService {
	private static anonymizePayload(payload: GdprPayload) {
		if (payload.customer) {
			delete payload.customer.email
			delete payload.customer.phone
		}
	}

	static async logGdprRequest(type: GdprRequestType, payload: GdprPayload): Promise<void> {
		this.anonymizePayload(payload)
		const shop = await ShopService.findByDomain(payload.shop_domain)
		if (shop && shop.id) {
			const request = new GdprRequest(undefined, type, shop.id, payload)
			await this.save(request)
		} else {
			console.error(
				`[GDPR] A ${type.toString()} request could not be logged: ${payload}`,
				JSON.stringify(payload)
			)
		}
	}

	static async save(request: GdprRequest) {
		const conn: Pool = await getConnection()
		await conn.query<ShopSchema>(`INSERT INTO gdpr_requests (shop_id, type, payload) VALUES ($1, $2, $3)`, [
			request.shopId,
			request.type.toString(),
			request.payload
		])
	}
}
