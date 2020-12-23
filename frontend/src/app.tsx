import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Route, Switch, Link as ReactRouterLink } from "react-router-dom"
import { AppProvider } from "@shopify/polaris"
import HomePage from "./homePage/HomePage"
import { Provider } from "@shopify/app-bridge-react"
import translations from "@shopify/polaris/locales/en.json"
import DeliverySlotPage from "./deliverySlotPage/DeliverySlotPage"
import CalendarPage from "./calendarPage/CalendarPage"
import NotFoundPage from "./NotFoundPage"

import "./styles/main.less"

const IS_EXTERNAL_LINK_REGEX = /^(?:[a-z][a-z\d+.-]*:|\/\/)/

function Link({ children, url = "", external, ref, ...rest }: any) {
	// react-router only supports links to pages it can handle itself. It does not
	// support arbirary links, so anything that is not a path-based link should
	// use a reglar old `a` tag
	if (external || IS_EXTERNAL_LINK_REGEX.test(url)) {
		rest.target = "_blank"
		rest.rel = "noopener noreferrer"
		return (
			<a href={url} {...rest}>
				{children}
			</a>
		)
	}

	return (
		<ReactRouterLink to={url} {...rest}>
			{children}
		</ReactRouterLink>
	)
}

ReactDOM.render(
	<AppProvider i18n={translations} linkComponent={Link}>
		<Provider config={window.shopifyConfig}>
			<BrowserRouter>
				<Switch>
					<Route exact path="/app" component={HomePage} />
					<Route exact path="/app/resources/:shopResourceId/calendar/:year/:month" component={CalendarPage} />
					<Route exact path="/app/delivery_slots/:deliverySlotId" component={DeliverySlotPage} />
					<Route path="*" component={NotFoundPage} />
				</Switch>
			</BrowserRouter>
		</Provider>
	</AppProvider>,
	document.getElementById("app")
)
