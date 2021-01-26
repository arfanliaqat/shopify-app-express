import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import { ANCHOR_ID, SHOPIFY_APP_URL } from "./constants"

render(<AvailableDatePicker />, document.getElementById(ANCHOR_ID))

function loadStyles(cssFileUrl: string): void {
	const link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.media = "screen,print";
	link.href = cssFileUrl;
	document.getElementsByTagName("head")[0].appendChild(link);
}

loadStyles(SHOPIFY_APP_URL + "/widget/widget.css")
