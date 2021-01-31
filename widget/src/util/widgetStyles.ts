import { WidgetStyles } from "../models/WidgetSettings"

const queries: WidgetStyles = {
	errorFontColor: ".h10-date-picker-error { color: $$ }",
	calendarBoxShadow: ".h10cal { box-shadow: $$ }",
	calendarBorderRadius: ".h10cal { border-radius: $$ }",
	calendarBackgroundColor: ".h10cal { background-color: $$ }",
	headerFontColor: ".h10cal .h10cal-month { color: $$ }",
	arrowIconColor: ".h10cal .h10cal-header .h10cal-previous, .h10cal .h10cal-header .h10cal-next { color: $$ }",
	headerDaysFontColor: ".h10cal .h10cal-header .h10cal-day-names { color: $$ }",
	dayUnavailableFontColor: ".h10cal .h10cal-body .h10cal-week .h10cal-day.h10cal-unavailable > span { color: $$ }",
	dayAvailableFontColor: ".h10cal .h10cal-body .h10cal-week .h10cal-day.h10cal-available > span { color: $$ }",
	dayHoveringBackgroundColor: ".h10cal .h10cal-body .h10cal-week .h10cal-day.h10cal-available:hover:not(.h10cal-selected) > span { background-color: $$ }",
	dayHoveringFontColor: ".h10cal .h10cal-body .h10cal-week .h10cal-day.h10cal-available:hover:not(.h10cal-selected) > span { color: $$ }",
	daySelectedBackgroundColor: ".h10cal .h10cal-body .h10cal-week .h10cal-day.h10cal-selected > span { background-color: $$ }",
	daySelectedFontColor: ".h10cal .h10cal-body .h10cal-week .h10cal-day.h10cal-selected > span { color: $$ }"
}

export function getCssFromWidgetStyles(widgetStyles: WidgetStyles): string {
	const css = []
	for (const [key, query] of Object.entries(queries)) {
		if (query) {
			css.push(query.replace("$$", widgetStyles[key]))
		}
	}
	return css.join("\n")
}
