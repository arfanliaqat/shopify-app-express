import { h, render } from "preact"
import AvailableDatePicker from "./AvilableDatePicker"
import "./styles/main.less"
import { anchorId, appUrl } from "./constants"
import axios from "axios"

export let anchorElement = undefined

function initWidget() {
	if (anchorElement) {
		return
	}
	anchorElement = document.getElementById(anchorId)
	if (!anchorElement) {
		const productForm = document.querySelectorAll("form[action*='/cart/add']")
		if (productForm?.length > 0) {
			anchorElement = document.createElement("div")
			anchorElement.id = anchorId
			productForm[0].append(anchorElement)
		}
	}
	if (anchorElement) {
		try {
			render(<AvailableDatePicker />, anchorElement)
		} catch (e) {
			console.error(e)
			axios.post(appUrl + "/errors", { error: e.stack }, {
				headers: {
					Accept: "application/json"
				}
			})
		}
	}
}


const jQuery: any | undefined = (window as any).jQuery

if (jQuery) {
	jQuery(() => {
		initWidget()
	})
} else {
	initWidget()
}
