import { Moment } from "moment"

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

export function getDaysBetween(start: Moment, end: Moment, unit: "day" | "week"): Moment[] {
	const days = []
	for (let cursor = start.clone(); cursor.isBefore(end); cursor.add(1, unit)) {
		days.push(cursor.clone())
	}
	return days
}
