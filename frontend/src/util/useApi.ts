import { useState, useEffect, useCallback } from "react"
import Axios, { Method } from "axios"

type Error = any // TODO

interface ApiRequest {
	url: string
	method?: Method
	postData?: any
	queryParams?: any
}

interface UseApiState<T> {
	isLoading?: boolean
	data?: T
	error?: any
	setApiRequest: (apiRequest: ApiRequest) => void
}

export interface UseApiParams<T> {
	onSuccess?: (body: T, apiRequest: ApiRequest) => void
	onError?: (error: Error, apiRequest: ApiRequest) => void
}

export function useApi<T>({ onSuccess, onError }: UseApiParams<T>): UseApiState<T> {
	const [apiRequest, setApiRequest] = useState<ApiRequest | undefined>()
	const [isLoading, setIsLoading] = useState<boolean>()
	const [data, setData] = useState<T>()

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const response = await Axios(apiRequest.url, {
					method: apiRequest.method || "GET",
					data: apiRequest.postData,
					params: apiRequest.queryParams
				})
				setData(response.data)
				if (onSuccess) {
					onSuccess(response.data, apiRequest)
				}
			} catch (error) {
				if (onError) {
					onError(error, apiRequest)
				}
			}
			setIsLoading(false)
		}
		if (apiRequest) {
			fetchData()
		}
	}, [apiRequest])

	return {
		setApiRequest,
		isLoading,
		data
	}
}
