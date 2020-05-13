import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

export interface IAPIRequestParams extends AxiosRequestConfig {
	version?: number,
	method: "GET" | "POST" | "PUT" | "DELETE",
}

/**
 * Used to make an API request.
 * @param params {IAPIRequestParams}
 *
 * @return {Promise<AxiosResponse>}
 */
export function api_request(params: IAPIRequestParams): Promise<AxiosResponse> {
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
	return axios(config);
}
