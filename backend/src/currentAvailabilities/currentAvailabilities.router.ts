import { Request, Response, Router } from "express"
import { devOnly } from "../util/middlewares"
import { loadConnectedShop } from "../shop/shop.middleware"
import { loadAccessToken } from "../accessToken/accessToken.middleware"
import { getLocals } from "../util/locals"
import { handleErrors, UnexpectedError } from "../util/error"
import { CurrentAvailabilityService } from "./currentAvailabilities.service"
import moment from "moment"

const router = Router()

router.get(
	"/refresh_current_availabilities",
	[devOnly, loadConnectedShop, loadAccessToken],
	async (req: Request, res: Response) => {
		try {
			const { connectedShop } = getLocals(res)
			if (!connectedShop) throw new UnexpectedError("`connectedShop` shouldn't be null")
			const start = moment()
			await CurrentAvailabilityService.refreshAllByShop(connectedShop)
			const time = moment().valueOf() - start.valueOf()
			res.send("Done in " + time + "ms")
		} catch (error) {
			handleErrors(res, error)
		}
	}
)

export default router
