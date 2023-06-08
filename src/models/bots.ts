import { Enums } from "../utils/enums";
import { TradeData, TradeResponse } from "./wss";
import CryptoJS from "crypto-js";
import axios from "axios";

export class BingXBot {
    private hasOrder: boolean

    constructor() {
        this.hasOrder = false;
    }

    evaluateTradeResponse(response: TradeResponse) {
        const data: TradeData = {
            symbol: response.data?.s,
            price: parseFloat(response.data?.p),
            quantity: "0.001"
        }

        if (data.symbol)
            console.log(`\nPar: ${data.symbol}\nPreço: ${data.price}`);

        if (!this.hasOrder && data.price <= 26600) {
            this.newOrder(data, Enums.BUY);
            this.hasOrder = true;
        }
        else if (this.hasOrder && data.price > 26700) {
            this.newOrder(data, Enums.SELL);
            this.hasOrder = false;
        }
    }


    newOrder = async (data: TradeData, side: Enums) => {

        const api = {
            uri: "/openApi/swap/v2/trade/order",
            method: "POST",
            payload: {
                symbol: data.symbol,
                side: "",
                type: "",
                timeInForce: 0,
                quantity: 0,
                quoteOrderQty: 0,
                price: 0,
                recvWindow: 0,
                timestamp: 0
            },
            protocol: "https"
        }
        // async function main() {

        //     let  parameters = ""
        //     for (const key in api.payload) {
        //         parameters += key+"="+api.payload[key]+"&"
        //     }
        //     if (parameters) {
        //         parameters = parameters.substring(0,parameters.length)
        //     }
        //     await bingXOpenApiTest(api.protocol, api.host, api.uri, api.method, API_KEY, API_SECRET, parameters)
        // }
        // main().catch(console.err);
        // async function bingXOpenApiTest(protocol,host, api, method, API_KEY, API_SECRET, parameters) {
        //     const timestamp = new Date().getTime()
        //     parameters = parameters+"&timestamp="+timestamp
        //     const sign = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(parameters, API_SECRET))
        //     const url = protocol+"://"+host+api+parameters+"&signature="+sign
        //     console.log("protocol:", protocol)
        //     console.log("method:", method)
        //     console.log("host:", host)
        //     console.log("api:", api)
        //     console.log("parameters:", parameters)
        //     console.log("sign:", sign)
        //     console.log(method, url)
        //     const headers = {
        //         'X-BX-APIKEY': API_KEY,
        //     }
        //     const resp = await doAxios(url, method, headers, "", false)
        //     console.log("response:", resp)
        // }

        // async function doAxios(uri, method, headers, data, async, timeout) {
        //     let respData = null;
        //     await axios({
        //         method: method,
        //         url: uri,
        //         data: data,
        //         async: async,
        //         headers: headers,
        //         timeout: timeout || 1000 * 60 * 3,
        //     })
        //         .then(res => {
        //             respData = res.data
        //         })
        //         .catch(error => { });
        //     return respData
        // }
        this.log(data, Enums.SELL)
    }

    private log(data: TradeData, type: Enums) {
        console.log("\n*** === ***");

        if (type == Enums.BUY) {
            console.log("Ordem de compra enviada!");
        } else {
            console.log("Ordem de venda enviada!");
        }

        console.log("__\nDetalhes:");
        console.log(`Par: ${data.symbol}`);
        console.log(`Preço: USD ${data.price}`);
        console.log(`Quantidade: ${data.quantity}`);
        console.log("=== *** ===\n");
    }
}