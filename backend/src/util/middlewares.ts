import { NextFunction, Request, Response } from "express"
import { isDev } from "./constants"

export function devOnly(req: Request, res: Response, next: NextFunction): void {
	if (isDev) {
		next()
	} else {
		res.status(403).end("Dev only route")
	}
}
