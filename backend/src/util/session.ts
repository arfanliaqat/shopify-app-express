import { CookieOptions, Request, Response } from "express"

type AppSession = { [key: string]: string | undefined }

const cookieOptions = { path: "/", sameSite: "none", httpOnly: true, secure: true, signed: true } as CookieOptions
const cookieName = "appSession"

function setSessionCookie(res: Response, value: string): void {
	res.cookie(cookieName, value, cookieOptions)
}

function getSessionCookieValue(req: Request): string | undefined {
	return req.signedCookies[cookieName]
}

function serialize(obj: any): string {
	return JSON.stringify(obj)
}

function deserialize(str: string | undefined): AppSession {
	if (!str) return {}
	return JSON.parse(str)
}

export function updateSession(req: Request, res: Response, newValues: AppSession): void {
	const sessionStr = getSessionCookieValue(req)
	const currentSession = deserialize(sessionStr)
	const newSession = { ...currentSession, ...newValues }
	setSessionCookie(res, serialize(newSession))
}

export function getSession(req: Request): AppSession {
	const sessionStr = getSessionCookieValue(req)
	return deserialize(sessionStr)
}

export function clearSession(res: Response): void {
	res.clearCookie(cookieName, cookieOptions)
}
