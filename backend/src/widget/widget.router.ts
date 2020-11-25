import { Request, Response, Router } from "express"

const router = Router()

router.get("/product_availability/:productId", async (req: Request, res: Response) => {
	res.send({
		hello: "world"
	})
})

export default router
