import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import "./styles/main.less"
import { anchorElement } from "./constants"

if (anchorElement) {
	render(<AvailableDatePicker/>, anchorElement)
}
