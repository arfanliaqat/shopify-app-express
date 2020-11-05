export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
}

export function capitalizeWords(str: string): string {
	if (!str) {
		return null
	} else {
		return str
			.split(" ")
			.map((val) => capitalize(val.toLowerCase()))
			.join(" ")
	}
}
