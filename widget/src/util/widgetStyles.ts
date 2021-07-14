import { WidgetStyles } from "../models/WidgetSettings"
import { defaultWidgetStyles } from "../../../backend/src/util/constants"

const queries: WidgetStyles = {
	errorFontColor: ".buunto-error-message { color: $$ }",
	errorBorderColor: ".buuntoCal.buunto-error { border: 1px solid $$ } .buunto-dropdown.buunto-error { border: 1px solid $$ }",
	calendarBoxShadow: ".buuntoCal { box-shadow: $$ }",
	calendarBorderRadius: ".buuntoCal { border-radius: $$ }",
	calendarBackgroundColor: ".buuntoCal { background-color: $$ }",
	headerFontColor: ".buuntoCal .buuntoCal-month { color: $$ }",
	arrowIconColor: ".buuntoCal .buuntoCal-header .buuntoCal-previous, .buuntoCal .buuntoCal-header .buuntoCal-next { color: $$ }",
	headerDaysFontColor: ".buuntoCal .buuntoCal-day-names .buuntoCal-day-name { color: $$ }",
	headerDaysFontWeight: ".buuntoCal .buuntoCal-day-names .buuntoCal-day-name { font-weight: $$ }",
	dayUnavailableFontColor: ".buuntoCal .buuntoCal-body .buuntoCal-week .buuntoCal-day.buuntoCal-unavailable > span { color: $$ }",
	dayAvailableFontColor: ".buuntoCal .buuntoCal-body .buuntoCal-week .buuntoCal-day.buuntoCal-available > span { color: $$ }",
	dayHoveringBackgroundColor: ".buuntoCal .buuntoCal-body .buuntoCal-week .buuntoCal-day.buuntoCal-available:hover:not(.buuntoCal-selected) > span { background-color: $$ }",
	dayHoveringFontColor: ".buuntoCal .buuntoCal-body .buuntoCal-week .buuntoCal-day.buuntoCal-available:hover:not(.buuntoCal-selected) > span { color: $$ }",
	daySelectedBackgroundColor: ".buuntoCal .buuntoCal-body .buuntoCal-week .buuntoCal-day.buuntoCal-selected > span { background-color: $$ }",
	daySelectedFontColor: ".buuntoCal .buuntoCal-body .buuntoCal-week .buuntoCal-day.buuntoCal-selected > span { color: $$ }",
	previewBackgroundColor: "",
	dropdownBorderColor: ".buunto-dropdown { border-color: $$ }",
	dropdownBorderWidth: ".buunto-dropdown { border-width: $$ }",
	dropdownBackgroundColor: ".buunto-dropdown { background-color: $$ }",
	dropdownTextColor: ".buunto-dropdown { color: $$ }"
}

export function getCssFromWidgetStyles(widgetStyles: WidgetStyles): string {
	const css = []
	for (const [key, query] of Object.entries(queries)) {
		if (query && (widgetStyles[key] || defaultWidgetStyles[key])) {
			css.push(query.replace(/\$\$/g, widgetStyles[key] ?? defaultWidgetStyles[key]))
		}
	}
	return css.join("\n")
}
