import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import "./styles/main.less"
import { anchorElement, appUrl } from "./constants"
import axios from "axios"

if (anchorElement) {
	try {
		render(<AvailableDatePicker/>, anchorElement)
	} catch (e) {
		console.error(e)
		axios.post(appUrl + "/errors", { error: e.stack }, {
			headers: {
				Accept: "application/json"
			}
		})
	}
}
