import React from "react"
import axios from "axios"

interface Props {}

interface State {
	hasError: boolean
}

export default class ErrorBoundary extends React.Component<Props, State> {
	constructor(props) {
		super(props)
		this.state = { hasError: false }
	}

	componentDidCatch(error, info) {
		this.setState({ hasError: true })

		axios.post(
			"/errors",
			{ error: error.stack },
			{
				headers: {
					Accept: "application/json"
				}
			}
		)
	}

	render() {
		if (this.state.hasError) {
			return null
		}
		return this.props.children
	}
}
