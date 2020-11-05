import React from "react"
import { Link } from "react-router-dom"

interface Props {
	url: string
}

export function AdapterLink({ url, ...rest }: Props) {
	return <Link to={url} {...rest} />
}
