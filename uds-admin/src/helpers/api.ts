import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

export interface IAPIRequestParams extends AxiosRequestConfig {
	version?: number,
	method: "GET" | "POST" | "PUT" | "DELETE",
}

export interface IAPIResponseData extends AxiosResponse {
	data: {
		error_code: number,
		message: string,
		payload: any
	}
}

/**
 * Used to make an API request.
 */
export function api_request<T>(params: IAPIRequestParams): Promise<T> {
	const {
		url,
		method,
		data,
		headers,
		params: p,
		version
	} = params;
	
	const config: IAPIRequestParams = {url, method, version};
	if (data) config.data = data;
	if (headers) config.headers = headers;
	if (p) config.params = p;
	config.url = `/v${version ? version : 1}/${config.url}`;
	return axios.request<{}, T>(config);
}
