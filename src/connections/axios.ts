import axios from "axios";
import { RestMethod } from "../utils/enums";

export class AxiosRequest {
    private readonly uri: string;
    private readonly timeout: number;

    constructor(uri: string, timeout?: number) {
        this.uri = uri;
        this.timeout = timeout || 60000 * 1.5
    }

    async get() {
        return await this.doAxios(RestMethod.GET);
    }

    async post() {
        return await this.doAxios(RestMethod.POST);
    }

    private async doAxios(method: RestMethod) {
        return await axios({
            method: method,
            url: this.uri,
            headers: {
                'X-BX-APIKEY': process.env.API_KEY || ""
            },
            timeout: this.timeout
        })
            .then(res => {
                return res.data
            })
            .catch((error: Error) => console.log(error));
    }
}