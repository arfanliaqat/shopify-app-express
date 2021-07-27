import { h, render } from "preact"
import AvailableDatePicker from "./AvailableDatePicker"
import "./styles/main.less"
import { anchorId, appUrl } from "./constants"
import axios from "axios"
import { fetchWidgetSettings } from "./util/api"
import { AnchorPosition, WidgetSettings } from "./models/WidgetSettings"
import { DEFAULT_ANCHOR_POSITION, DEFAULT_PLACEMENT_METHOD } from "../../backend/src/util/constants"

export let anchorElement = undefined

type SupportedTheme =
	"DEBUT"
	| "NARRATIVE"
	| "MINIMAL"
	| "SIMPLE"
	| "BROOKLYN"
	| "SUPPLY"
	| "BOUNDLESS"
	| "VENTURE"
	| "EXPRESS"

function getThemeId(): number {
	return (window as any).Shopify?.theme?.theme_store_id as number
}

function getTheme(): SupportedTheme {
	const themeId = getThemeId()
	switch (themeId) {
		case 796:
			return "DEBUT"
		case 829:
			return "NARRATIVE"
		case 380:
			return "MINIMAL"
		case 578:
			return "SIMPLE"
		case 730:
			return "BROOKLYN"
		case 679:
			return "SUPPLY"
		case 766:
			return "BOUNDLESS"
		case 775:
			return "VENTURE"
		case 885:
			return "EXPRESS"
	}
	return undefined
}

const toInsertPosition = (anchorPosition: AnchorPosition): InsertPosition => {
	if (anchorPosition == "BEFORE") return "beforebegin"
	if (anchorPosition == "FIRST_ELEMENT") return "afterbegin"
	if (anchorPosition == "LAST_ELEMENT") return "beforeend"
	return "afterend"
}

function getProductQueryAndPosition(): [string | undefined, AnchorPosition] {
	const theme = getTheme()
	if (theme == "DEBUT") return [".product-form__controls-group--submit", "BEFORE"]
	if (theme == "VENTURE") return [".product-form__item--submit", "BEFORE"]
	if (theme == "EXPRESS") return [".product-form__buttons", "BEFORE"]
	if (theme == "BOUNDLESS") return ["#AddToCart-product-template", "BEFORE"]
	return [undefined, "FIRST_ELEMENT"]
}

function getCartQueryAndPosition(): [string, AnchorPosition] {
	const theme = getTheme()
	if (theme == "DEBUT") return [".cart__buttons-container", "BEFORE"]
	if (theme == "NARRATIVE") return [".cart-policies", "AFTER"]
	if (theme == "MINIMAL") return [".cart__policies", "AFTER"]
	if (theme == "SIMPLE") return [".cart__policies", "AFTER"]
	if (theme == "BROOKLYN") return [".cart__row:last-child", "FIRST_ELEMENT"]
	if (theme == "SUPPLY") return [".cart__policies", "AFTER"]
	if (theme == "BOUNDLESS") return [".cart__policies", "AFTER"]
	if (theme == "VENTURE") return [".cart__taxes", "AFTER"]
	if (theme == "EXPRESS") return [".cart__totals", "AFTER"]
	return ["table", "AFTER"]
}

function initWidget() {
	fetchWidgetSettings().then((widgetSettings: WidgetSettings) => {
		if (anchorElement) {
			return
		}

		const productForm = document.querySelectorAll("form[action*='/cart/add']")
		const hasProductForm = productForm.length > 0
		const cartForm = document.querySelector("form[action='/cart']:not(#CartDrawer),form[action*='/cart?']:not(#CartDrawer)")
		const hasCartForm = !!cartForm
		const isCartPage = hasCartForm && !hasProductForm || window.location.pathname.startsWith("/cart")

		anchorElement = document.getElementById(anchorId)
		if (!anchorElement) {
			const placementMethod = widgetSettings.placementMethod || DEFAULT_PLACEMENT_METHOD
			const anchorPosition = widgetSettings.anchorPosition || DEFAULT_ANCHOR_POSITION
			const isManualPlacement = placementMethod == "MANUAL" && widgetSettings.anchorSelector && anchorPosition
			if (isManualPlacement) {
				const refElement = document.querySelector(widgetSettings.anchorSelector)
				if (refElement) {
					anchorElement = document.createElement("div")
					anchorElement.id = anchorId
					refElement.insertAdjacentElement(toInsertPosition(anchorPosition), anchorElement)
				}
			} else {
				if (isCartPage) {
					if (!anchorElement && cartForm) {
						anchorElement = document.createElement("div")
						anchorElement.id = anchorId
						const [elementQuery, anchorPosition] = getCartQueryAndPosition()
						const refElement = cartForm.querySelector(elementQuery)
						if (refElement) {
							refElement.insertAdjacentElement(toInsertPosition(anchorPosition), anchorElement)
						}
					}
				} else {
					if (!anchorElement) {
						if (productForm?.length === 1) {
							anchorElement = document.createElement("div")
							anchorElement.id = anchorId
							const [elementQuery, anchorPosition] = getProductQueryAndPosition()
							const refElement = elementQuery ? productForm[0].querySelector(elementQuery) : productForm[0]
							refElement.insertAdjacentElement(toInsertPosition(anchorPosition), anchorElement)
						}
					}
				}
			}
		}

		if (anchorElement) {
			const theme = getTheme()
			if (theme) {
				const themeName = theme.toLowerCase()
				anchorElement.className = (anchorElement.className + " buunto-theme-" + themeName).trim()
				const formElement = anchorElement.closest("form")
				if (formElement) {
					formElement.className = (formElement.className + " buunto-theme-" + themeName + "-form").trim()
				}
			}
			try {
				render(<AvailableDatePicker widgetSettings={widgetSettings} isCartPage={isCartPage} />, anchorElement)
			} catch (e) {
				console.error(e)
				axios.post(appUrl + "/errors", { error: e.stack }, {
					headers: {
						Accept: "application/json"
					}
				})
			}
		}
	})
}

function initOrderConfirmationPage() {
	if ((orderInfo?.attributes || []).length > 0) {
		const refElement = document.querySelector("p.os-step__description:last-child")

		const holderElement = document.createElement("div")
		holderElement.className = "buunto-order-confirmation-attributes"
		refElement.insertAdjacentElement(toInsertPosition("AFTER"), holderElement)

		orderInfo.attributes.forEach(attribute => {
			const attributeElement = document.createElement("p")
			attributeElement.className = "buunto-order-confirmation-attribute"
			attributeElement.innerHTML = `<strong>${attribute.label}:</strong> ${attribute.value}`
			holderElement.insertAdjacentElement(toInsertPosition("LAST_ELEMENT"), attributeElement)
		})
	}
}

const isAdmin = window.location.href.startsWith(appUrl)

type OrderAttribute = { label: string, value: string }
interface OrderInfo {
	attributes?: OrderAttribute[]
}

const orderInfo = (window as any).BuuntoOrder as OrderInfo

if (isAdmin) {
	anchorElement = document.getElementById(anchorId)
	render(<AvailableDatePicker />, anchorElement)
} else if (orderInfo) {
	initOrderConfirmationPage()
} else {
	const jQuery: any | undefined = (window as any).jQuery
	if (jQuery) {
		jQuery(() => {
			initWidget()
		})
	} else {
		initWidget()
	}
}
