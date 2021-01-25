import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import { ANCHOR_ID } from "./constants"

render(<AvailableDatePicker />, document.getElementById(ANCHOR_ID))
