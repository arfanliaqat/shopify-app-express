import { h, render } from "preact"
import AvailableDatePicker from "./AvailableDatePicker"
import "./styles/main.less"
import { anchorId, appUrl } from "./constants"
import axios from "axios"
import { fetchWidgetSettings } from "./util/api"
import { AnchorPosition, Page, WidgetSettings } from "./models/WidgetSettings"
import {
	DEFAULT_ANCHOR_POSITION,
	DEFAULT_PLACEMENT_METHOD,
	DEFAULT_SHOW_ON_PAGE
} from "../../backend/src/util/constants"
import _ from "lodash"

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
	| "DAWN"

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
		case 887:
			return "DAWN"
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

function getCartPageQueryAndPosition(): [string, AnchorPosition] {
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
	if (theme == "DAWN") return [".cart__ctas", "BEFORE"]
	return ["form table", "AFTER"]
}

function getCartDrawerQueryAndPosition(): [string, AnchorPosition] {
	const theme = getTheme()
	if (theme == "NARRATIVE") return [".cart-drawer__disclaimer", "AFTER"]
	if (theme == "EXPRESS") return [".cart-drawer__notice", "AFTER"]
	return [undefined, undefined]
}

function getProductVariantId(): number | undefined {
	const productForm = _.first(getProductFormElements())
	if (productForm) {
		const idField = productForm.querySelector("[name='id']")
		if (idField.tagName == "SELECT") {
			const strProductVariantId = idField.querySelector("option[selected]")?.getAttribute("value")
			return strProductVariantId ? parseInt(strProductVariantId) : undefined
		}
		if (idField.tagName == "INPUT") {
			const strProductVariantId = idField.getAttribute("value")
			return strProductVariantId ? parseInt(strProductVariantId) : undefined
		}
	}
}

function getProductFormElements(): Element[] {
	const theme = getTheme()
	if (theme == "DAWN") {
		return Array.from(document.querySelectorAll("form[action*='/cart/add']"))
			.filter((el) => el.querySelector("[type='submit']"))
	} else {
		return Array.from(document.querySelectorAll("form[action*='/cart/add']"))
	}
}

function getCartFormElement(): Element {
	const theme = getTheme()
	if (theme == "DAWN") {
		return document.querySelector("form[action='/cart'].cart__contents,form[action*='/cart?'].cart__contents")
	} else {
		return document.querySelector("form[action='/cart'],form[action*='/cart?']")
	}
}

function getFormId(showOnPage: Page, isCartPage: boolean, isCartDrawer: boolean): string | undefined {
	if (showOnPage == "CART" && isCartPage && !isCartDrawer) {
		return getCartFormElement()?.getAttribute("id")
	} else {
		const productForms = getProductFormElements()
		return productForms.length > 0 ? productForms[0]?.getAttribute("id") : undefined
	}
}

function initWidget() {
	const productVariantId = getProductVariantId()
	fetchWidgetSettings(productVariantId).then((widgetSettings: WidgetSettings) => {
		if (anchorElement) {
			return
		}

		const showOnPage = widgetSettings.showOnPage || DEFAULT_SHOW_ON_PAGE
		const productForm = getProductFormElements()
		const hasProductForm = productForm.length > 0
		const cartForm = getCartFormElement()
		const hasCartForm = !!cartForm
		const isCartPage = hasCartForm && !hasProductForm || window.location.pathname.startsWith("/cart")
		let isCartDrawer = false

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
					if (anchorElement.closest(".drawer")) {
						isCartDrawer = true
					}
				}
			} else {
				if (showOnPage == "CART") {
					if (!anchorElement && cartForm) {
						anchorElement = document.createElement("div")
						anchorElement.id = anchorId
						const [cartDrawerQuery, cartDrawerAnchorPosition] = getCartDrawerQueryAndPosition()
						let refElement = cartDrawerQuery ? cartForm.querySelector(cartDrawerQuery) : undefined
						let anchorPosition = cartDrawerAnchorPosition
						if (!refElement) {
							const [cartPageQuery, cartPageAnchorPosition] = getCartPageQueryAndPosition()
							anchorPosition = cartPageAnchorPosition
							refElement = document.querySelector(cartPageQuery)
							if (!refElement) {
								// If the ref element is not found, make sure to default to something that works
								refElement = document.querySelector("form table")
								anchorPosition = "AFTER"
							}
							if (!refElement) {
								// Make extra sure the date picker appears somewhere on the cart page
								refElement = cartForm
								anchorPosition = "LAST_ELEMENT"
							}
						} else {
							isCartDrawer = true
						}
						if (refElement) {
							refElement.insertAdjacentElement(toInsertPosition(anchorPosition), anchorElement)
						}
					}
				} else {
					if (!anchorElement) {
						if (productForm?.length === 1) {
							anchorElement = document.createElement("div")
							anchorElement.id = anchorId
							let [elementQuery, anchorPosition] = getProductQueryAndPosition()
							let refElement = elementQuery ? productForm[0].querySelector(elementQuery) : productForm[0]
							if (!refElement) {
								// If the ref element is not found, make sure to default to something that works
								refElement = productForm[0]
								anchorPosition = "FIRST_ELEMENT"
							}
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

			const formId = getFormId(widgetSettings.showOnPage, isCartPage, isCartDrawer)
			try {
				render(
					<AvailableDatePicker
						widgetSettings={widgetSettings}
						isCartPage={isCartPage || isCartDrawer}
						isCartDrawer={isCartDrawer}
						formId={formId}
					/>, anchorElement
				)
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
	render(<AvailableDatePicker/>, anchorElement)
} else if (orderInfo) {
	initOrderConfirmationPage()
} else {
	initWidget()
}
