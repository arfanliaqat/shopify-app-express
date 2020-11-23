import React from "react"
import { RouteChildrenProps } from "react-router"

export default function NotFoundPage({ location }: RouteChildrenProps) {
	return <div>404 - {location.pathname}</div>
}
