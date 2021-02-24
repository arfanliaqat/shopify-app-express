import React from "react"
import { RouteChildrenProps } from "react-router"
import { Page } from "@shopify/polaris"

export default function NotFoundPage({}: RouteChildrenProps) {
	return <Page title="404">Page not found</Page>
}
