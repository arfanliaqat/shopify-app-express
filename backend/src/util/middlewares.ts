import { NextFunction, Request, Response } from "express"
import { isDev } from "./constants"

export function devOnly(req: Request, res: Response, next: NextFunction): void {
	if (isDev) {
		next()
	} else {
		res.status(403).end("Dev only route")
	}
}

export function noApiCallCache(req: Request, res: Response, next: NextFunction): void {
	if (req.method?.toUpperCase() == "GET" && req.headers.accept?.indexOf("application/json") !== -1) {
		res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store")
	}
	next()
}
