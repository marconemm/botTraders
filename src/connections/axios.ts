import axios, { AxiosRequestConfig } from "axios";
import { RestMethod } from "../utils/enums";

class AxiosRequest {
    private readonly headers: any;
    private readonly timeout: number;
    private uri: string;

    constructor(headers?: { "X-BX-APIKEY": string }, timeout?: number) {
        this.timeout = timeout || 60000 * 1.5
        this.headers = headers;
    }

    setURI(uri: string) {
        this.uri = uri;
    }

    async get() {
        return await this.doAxios(RestMethod.GET);
    }

    async post() {
        return await this.doAxios(RestMethod.POST);
    }

    private async doAxios(method: string) {
        return await axios({
            method: method,
            url: this.uri,
            headers: this.headers,
            timeout: this.timeout
        } as AxiosRequestConfig)
            .then(res => {
                this.uri = ""; // to avoid an accidental double call to the same URI.
                return res.data
            })
            .catch((error: Error) => {
                console.error(error)
            });
    }
}

export { AxiosRequest }