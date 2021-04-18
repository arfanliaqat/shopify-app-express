export type NotificationType = "APPROACHING_PLAN_LIMIT" | "REACHED_PLAN_LIMIT"

export interface NotificationSchema {
	id: string
	shop_id: string
	type: NotificationType
	created_date: string
}

export class Notification {
	constructor(
		public id: string | undefined,
		public shopId: string,
		public type: NotificationType,
		public createdDate?: string
	) {}

	static createFromSchema(schema: NotificationSchema): Notification {
		return new Notification(schema.id, schema.shop_id, schema.type, schema.created_date)
	}

	static createFromSchemas(schemas: NotificationSchema[]): Notification[] {
		return schemas.map(this.createFromSchema)
	}
}
