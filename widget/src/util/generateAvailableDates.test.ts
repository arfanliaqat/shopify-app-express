import { generateAvailableDates, getCutoffTime } from "./generateAvailableDates"
import { WidgetSettings } from "../models/WidgetSettings"
import moment from "moment"
import { SYSTEM_DATETIME_FORMAT } from "../../../backend/src/util/constants"

const mockSettings: WidgetSettings = {
	isVisible: true,
	pickerType: "CALENDAR",
	locale: "en",
	firstAvailableDateInDays: 1,
	cutOffTime: "15:00",
	lastAvailableDateInWeeks: 12,
	availableWeekDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
	disabledDates: [],
	mandatoryDateSelect: true,
	styles: {
		errorFontColor: "#8b0000",
		calendarBoxShadow: "0 0 5px rgba(0,0,0,0.15)",
		calendarBorderRadius: "10px",
		calendarBackgroundColor: "#ffffff",
		headerFontColor: "#333333",
		arrowIconColor: "#000000",
		headerDaysFontColor: "#333333",
		dayUnavailableFontColor: "#aaaaaa",
		dayAvailableFontColor: "#333333",
		dayHoveringBackgroundColor: "#eeeeee",
		dayHoveringFontColor: "#333333",
		daySelectedBackgroundColor: "#333333",
		daySelectedFontColor: "#ffffff",
		previewBackgroundColor: "#ffffff",
		headerDaysFontWeight: "bold",
		dropdownBackgroundColor: "#ffffff",
		dropdownBorderColor: "#cccccc",
		dropdownBorderWidth: "1px",
		dropdownTextColor: "#333333"
	},
	messages: {
		datePickerLabel: "Pick a delivery date:",
		noDateSelectedError: "Please select a delivery date before adding to the cart.",
		noAvailableDatesError: "There are currently no dates available for this product.",
		soldOut: "sold out"
	}
}

describe("generateAvailableDates", () => {
	test("Get cutoff time", () => {
		expect(getCutoffTime([], "15:00", moment("2021-07-26 10:00:00")).format(SYSTEM_DATETIME_FORMAT)).toBe("2021-07-26 15:00:00")
		expect(getCutoffTime(["MONDAY"], "15:00", moment("2021-07-26 10:00:00")).format(SYSTEM_DATETIME_FORMAT)).toBe("2021-07-26 15:00:00")
		expect(getCutoffTime(["MONDAY"], "15:00", moment("2021-07-26 16:00:00")).format(SYSTEM_DATETIME_FORMAT)).toBe("2021-07-26 15:00:00")
		expect(getCutoffTime(["SUNDAY"], "15:00", moment("2021-07-26 10:00:00")).format(SYSTEM_DATETIME_FORMAT)).toBe("2021-07-25 15:00:00")
		expect(getCutoffTime(["SUNDAY"], "15:00", moment("2021-07-26 16:00:00")).format(SYSTEM_DATETIME_FORMAT)).toBe("2021-07-25 15:00:00")
		expect(getCutoffTime(["SATURDAY"], "15:00", moment("2021-07-26 10:00:00")).format(SYSTEM_DATETIME_FORMAT)).toBe("2021-07-24 15:00:00")
		expect(getCutoffTime(["TUESDAY"], "15:00", moment("2021-07-26 10:00:00")).format(SYSTEM_DATETIME_FORMAT)).toBe("2021-07-20 15:00:00")
	})

	test("Cutoff time logic", async () => {
		expect(generateAvailableDates(mockSettings, moment("2021-07-26 10:00:00"))[0].date).toBe("2021-07-27") // Friday before cutoff => Tuesday
		expect(generateAvailableDates(mockSettings, moment("2021-07-26 15:10:00"))[0].date).toBe("2021-07-28") // Friday after cutoff => Tuesday
		expect(generateAvailableDates(mockSettings, moment("2021-07-30 14:00:00"))[0].date).toBe("2021-08-02") // Friday before cutoff => Monday
		expect(generateAvailableDates(mockSettings, moment("2021-07-30 16:00:00"))[0].date).toBe("2021-08-03") // Friday after cutoff => Tuesday
		expect(generateAvailableDates(mockSettings, moment("2021-07-31 14:00:00"))[0].date).toBe("2021-08-03") // Saturday before 15:00 => Tuesday
		expect(generateAvailableDates(mockSettings, moment("2021-07-31 16:00:00"))[0].date).toBe("2021-08-03") // Saturday after 15:00 => Tuesday
		expect(generateAvailableDates(mockSettings, moment("2021-08-01 14:00:00"))[0].date).toBe("2021-08-03") // Saturday before 15:00 => Tuesday
		expect(generateAvailableDates(mockSettings, moment("2021-08-01 16:00:00"))[0].date).toBe("2021-08-03") // Saturday after 15:00 => Tuesday
	})
})
