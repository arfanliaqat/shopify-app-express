import { AxiosError } from "axios"
import { Response } from "express"

export class AxiosCallError extends Error {
	constructor(axiosError: AxiosError) {
		super()
		this.name = "AxiosCallError"
		this.message =
			`${axiosError.config.method?.toLocaleUpperCase()} ${axiosError.config.url}: ` +
			`Status: ${axiosError.response?.status || "-"} ${JSON.stringify(axiosError.response?.data)}`
	}
}
export class UnexpectedError extends Error {}
export class BadParameter extends Error {}

const isDevMode = process.env.MODE != "PRODUCTION"

export function handleErrors(res: Response, error: Error): void {
	if (error instanceof AxiosCallError) {
		console.error(error)
		res.status(500)
		if (isDevMode) {
			res.send("<pre>" + error.stack + "</pre>")
		} else {
			res.send("Unexpected error")
		}
	} else if (error instanceof BadParameter) {
		res.status(400)
		if (isDevMode) {
			res.send(error.message)
		} else {
			res.send("Bad parameter")
		}
	} else {
		console.error(error)
		res.status(500)
		if (isDevMode) {
			res.send("<pre>" + error.stack + "</pre>")
		} else {
			res.send("Unexpected error")
		}
	}
}

export function handleAxiosErrors(error: AxiosError | Error): void {
	if ((error as any).config && (error as any).config.url) {
		throw new AxiosCallError(error as AxiosError)
	} else {
		throw new UnexpectedError(error as any)
	}
}
