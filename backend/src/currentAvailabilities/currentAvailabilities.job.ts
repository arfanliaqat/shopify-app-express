import cron from "node-cron"
import { CurrentAvailabilityService } from "./currentAvailabilities.service"
import { ShopService } from "../shop/shop.service"
import moment from "moment"

export class CurrentAvailabilityJob {
	static initJobs(): void {
		const cronExpr = "0 * * * *"
		cron.schedule(cronExpr, this.refreshAll)
		console.log(`Job registered - CurrentAvailabilitiesJob.refreshAll (${cronExpr})`)
	}

	static async refreshAll(): Promise<void> {
		// Job to refresh all the current availabilities in case days have gone in the past, changing the cached info
		// To handle timezones (in the future?)... and because I'm not sure about server clock and timezones in general yet

		const prefix = "[CurrentAvailabilitiesJob.refreshAll] "

		const timerStart = moment().valueOf()
		console.log(`${prefix} Job starting...`)
		const shops = await ShopService.findAllActiveShops()
		for (const shop of shops) {
			const shopTimerStart = moment().valueOf()
			console.log(`${prefix} Refreshing shop ${shop.domain} (id: ${shop.id})...`)
			await CurrentAvailabilityService.refreshAllByShop(shop)
			const shopTimerStop = moment().valueOf()
			console.log(
				`${prefix} Shop ${shop.domain} (id: ${shop.id}) refreshed in ${shopTimerStop - shopTimerStart} ms.`
			)
		}

		const timerStop = moment().valueOf()
		console.log(`${prefix} Done in ${(timerStop - timerStart) / 1000} seconds`)
	}
}

CurrentAvailabilityJob.initJobs()
