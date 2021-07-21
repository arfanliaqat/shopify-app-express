import { h, render } from "preact"
import AvailableDatePicker from "./AvailableDatePicker"
import "./styles/main.less"
import { anchorId, appUrl } from "./constants"
import axios from "axios"

export let anchorElement = undefined

function insertDiv(form: Element, query: string, grandParentElement?: true): boolean {
	const submitButtonContainer = form.querySelectorAll(query)
	if (submitButtonContainer?.length > 0) {
		const containerElement = grandParentElement ? submitButtonContainer[0].parentNode : submitButtonContainer[0]
		const submitButtonParent = containerElement.parentNode
		if (submitButtonParent) {
			anchorElement = document.createElement("div")
			anchorElement.id = anchorId
			submitButtonParent.insertBefore(anchorElement, containerElement)
			return true
		}
	}
	return false
}

function initWidget() {
	if (anchorElement) {
		return
	}

	const productForm = document.querySelectorAll("form[action*='/cart/add']")
	const hasProductForm = productForm.length > 0
	const cartForm = document.querySelectorAll("form[action='/cart'],form[action*='/cart?']")
	const hasCartForm = cartForm.length > 0
	const isCartPage = hasCartForm && !hasProductForm || window.location.pathname.startsWith("/cart")

	anchorElement = document.getElementById(anchorId)
	if (isCartPage) {
		if (!anchorElement && cartForm.length > 0) {
			insertDiv(cartForm[0], "[type='submit']", true)
		}
	} else {
		if (!anchorElement) {
			if (productForm?.length === 1) {
				anchorElement = document.createElement("div")
				anchorElement.id = anchorId
				productForm[0].append(anchorElement)
			}
		}
	}

	if (anchorElement) {
		try {
			render(<AvailableDatePicker isCartPage={isCartPage} />, anchorElement)
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
