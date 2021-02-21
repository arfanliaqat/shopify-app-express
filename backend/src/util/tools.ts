export function generateNonce(length: number): string {
	let text = ""
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

export function safeParseInt(value?: string): number | undefined {
	if (!value) return undefined
	return parseInt(value, 10)
}
