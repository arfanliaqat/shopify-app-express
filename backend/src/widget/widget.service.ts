import { WidgetSettings } from "../../../widget/src/models/WidgetSettings"

export class WidgetService {
	static findWidgetSettings(): WidgetSettings {
		return {
			pickerType: "CALENDAR"
		}
	}
}
