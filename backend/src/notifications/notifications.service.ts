import { Notification, NotificationSchema, NotificationType } from "./notifications.model"
import { Moment } from "moment"
import { Pool } from "pg"
import { getConnection } from "../util/database"
import { Shop } from "../shop/shop.model"
import { UnexpectedError } from "../util/error"
import { PostmarkService } from "./postmark.server"
import { ShopPlan } from "../shopPlan/shopPlan.model"

export default class NotificationService {
	static async findNotifications(
		shop: Shop,
		type: NotificationType,
		from: Moment,
		to: Moment
	): Promise<Notification[]> {
		if (!shop.id) throw new UnexpectedError("The shop's id isn't defined")
		const conn: Pool = await getConnection()
		const result = await conn.query<NotificationSchema>(
			`
			SELECT id, shop_id, type, created_date
			FROM notifications
			WHERE shop_id = $1 AND type = $2 AND created_date BETWEEN $3 AND $4`,
			[shop.id, type, from.toDate(), to.toDate()]
		)
		return Notification.createFromSchemas(result.rows)
	}

	static async insert(notification: Notification): Promise<Notification> {
		const conn: Pool = await getConnection()
		const result = await conn.query<NotificationSchema>(
			`INSERT INTO notifications (shop_id, type) VALUES ($1, $2) RETURNING id, shop_id, type, created_date`,
			[notification.shopId, notification.type]
		)
		return Notification.createFromSchemas(result.rows)[0]
	}

	static async reachedPlanLimit(shop: Shop, plan: ShopPlan): Promise<Notification> {
		if (!shop.id) throw new UnexpectedError("The shop's id isn't defined")
		const notification = new Notification(undefined, shop.id, "REACHED_PLAN_LIMIT")
		const savedNotification = await this.insert(notification)
		await PostmarkService.sendEmail(shop.email, "REACHED_PLAN_LIMIT", {
			order_limit: plan.orderLimit
		})
		return savedNotification
	}

	static async approachingPlanLimit(shop: Shop, plan: ShopPlan): Promise<Notification> {
		if (!shop.id) throw new UnexpectedError("The shop's id isn't defined")
		const notification = new Notification(undefined, shop.id, "APPROACHING_PLAN_LIMIT")
		const savedNotification = await this.insert(notification)
		await PostmarkService.sendEmail(shop.email, "APPROACHING_PLAN_LIMIT", {
			order_limit: plan.orderLimit
		})
		return savedNotification
	}
}
