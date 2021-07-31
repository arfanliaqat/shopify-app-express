import { Moment } from "moment"
import { RGBColor } from "@shopify/polaris/dist/types/latest/src/utilities/color-types"

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
}

export function capitalizeWords(str: string): string | null {
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

export function hexToRgb(h: string): RGBColor {
	let r: string = ""
	let g: string = ""
	let b: string = ""
	if (h.length == 4) {
		r = "0x" + h[1] + h[1]
		g = "0x" + h[2] + h[2]
		b = "0x" + h[3] + h[3]
	} else if (h.length == 7) {
		r = "0x" + h[1] + h[2]
		g = "0x" + h[3] + h[4]
		b = "0x" + h[5] + h[6]
	}
	return { red: +r, green: +g, blue: +b }
}
