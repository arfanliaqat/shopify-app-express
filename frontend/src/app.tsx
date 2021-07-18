import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Route, Switch, Link as ReactRouterLink } from "react-router-dom"
import { AppProvider } from "@shopify/polaris"
import HomePage from "./homePage/HomePage"
import { Provider } from "@shopify/app-bridge-react"
import translations from "@shopify/polaris/locales/en.json"
import AvailabilityPeriodPage from "./availabilityPeriodPage/AvailabilityPeriodPage"
import CalendarPage from "./calendarPage/CalendarPage"
import NotFoundPage from "./NotFoundPage"

import "./styles/main.less"
import SettingsPage from "./settingsPage/SettingsPage"
import { isStockByDateApp } from "./common/constants"
import PlansPage from "./plansPage/PlansPage"
import { shopifyConfig } from "./models/ShopifyConfig"
import GuidePage from "./helpPage/GuidePage"
import HelpScoutBeacon from "./util/HelpScoutBeacon"

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
		<Provider config={shopifyConfig}>
			<HelpScoutBeacon />
			<BrowserRouter>
				<Switch>
					<Route exact path="/app" component={isStockByDateApp ? HomePage : SettingsPage} />
					{isStockByDateApp && (
						<Route
							exact
							path="/app/resources/:shopResourceId/calendar/:year/:month"
							component={CalendarPage}
						/>
					)}
					{isStockByDateApp && (
						<Route
							exact
							path="/app/availability_periods/:availabilityPeriodId"
							component={AvailabilityPeriodPage}
						/>
					)}
					{isStockByDateApp && <Route exact path="/app/settings" component={SettingsPage} />}
					<Route path="/app/plans" component={PlansPage} />
					<Route path="/app/guide" component={GuidePage} />
					<Route path="*" component={NotFoundPage} />
				</Switch>
			</BrowserRouter>
		</Provider>
	</AppProvider>,
	document.getElementById("app")
)
