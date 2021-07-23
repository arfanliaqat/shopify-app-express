import * as postmark from "postmark"
import { NotificationType } from "./notifications.model"
import { TemplatedMessage } from "postmark/dist/client/models"
import { APP_NAME, isDev } from "../util/constants"

export const emailTestStore: TemplatedMessage[] = []

const globalTemplateModel = {
	product_name: APP_NAME == "STOCK_BY_DATE" ? "Buunto Stock By Date" : "Buunto Date Picker",
	company_name: "Buunto"
}

export function getEmailClient(): postmark.ServerClient | undefined {
	if (process.env.POSTMARK_API_TOKEN) {
		return new postmark.ServerClient(process.env.POSTMARK_API_TOKEN)
	}
}

function toPostmarkTemplateAlias(notificationType: NotificationType): string {
	return notificationType.replace(/_/g, "-").toLowerCase()
}

export class PostmarkService {
	static async sendEmail(
		to: string,
		notificationType: NotificationType,
		templateModel: { [key: string]: any }
	): Promise<void> {
		const emailClient = getEmailClient()
		const templateMessage: TemplatedMessage = {
			TemplateAlias: toPostmarkTemplateAlias(notificationType),
			From: "support@buunto.com",
			To: to,
			TemplateModel: {
				...globalTemplateModel,
				...templateModel
			}
		}
		if (emailClient && !isDev) {
			await emailClient.sendEmailWithTemplate(templateMessage)
		} else {
			emailTestStore.push(templateMessage)
			console.log(templateMessage)
		}
	}
}
