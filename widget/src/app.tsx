import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import { getAnchorElement } from "./constants"
import "./styles/main.less"

render(<AvailableDatePicker />, getAnchorElement())
