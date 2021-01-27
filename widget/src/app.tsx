import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import { ANCHOR_ID } from "./constants"
import "./styles/main.less"

render(<AvailableDatePicker />, document.getElementById(ANCHOR_ID))

// Might need that later on
//
// function loadStyles(cssFileUrl: string): void {
// 	const link = document.createElement("link");
// 	link.type = "text/css";
// 	link.rel = "stylesheet";
// 	link.media = "screen,print";
// 	link.href = cssFileUrl;
// 	document.getElementsByTagName("head")[0].appendChild(link);
// }
//
// loadStyles(SHOPIFY_APP_URL + "/widget/widget.css")
