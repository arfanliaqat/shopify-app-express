import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import { ANCHOR_ID } from "./constants"
import "./styles/main.less"

render(<AvailableDatePicker />, document.getElementById(ANCHOR_ID))
