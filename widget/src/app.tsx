import { h, render } from "preact"
import AvailableDatePicker from "./AvailableDatePicker"
import "./styles/main.less"
import { anchorId, appUrl } from "./constants"
import axios from "axios"

export let anchorElement = undefined

function initWidget() {
	if (anchorElement) {
		return
	}

	const isCartPage = document.querySelectorAll("form[action='/cart']").length > 0
	if (isCartPage) {
		anchorElement = document.getElementById(anchorId)
		if (!anchorElement) {
			const submitButtonContainer = document.querySelectorAll("div.cart__buttons-container")
			if (submitButtonContainer?.length === 1) {
				const submitButtonParent = submitButtonContainer[0].closest(":not(.cart__buttons-container)")
				if (submitButtonParent) {
					anchorElement = document.createElement("div")
					anchorElement.id = anchorId
					submitButtonParent.insertBefore(anchorElement, submitButtonContainer[0])
				}
			}
		}
	} else {
		anchorElement = document.getElementById(anchorId)
		if (!anchorElement) {
			const productForm = document.querySelectorAll("form[action*='/cart/add']")
			if (productForm?.length === 1) {
				anchorElement = document.createElement("div")
				anchorElement.id = anchorId
				productForm[0].append(anchorElement)
			}
		}
	}

	if (anchorElement) {
		try {
			if (anchorElement) {
				render(<AvailableDatePicker isCartPage={isCartPage} />, anchorElement)
			}
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
