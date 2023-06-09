import { AxiosRequest } from "../connections/axios";
import { Side, Type } from "../utils/enums";
import { INewOrderPayloadBingX, TradeData, TradeResponse } from "./wss";
import CryptoJS from "crypto-js";

export class BingXBot {
    private readonly type: Type
    private readonly endpoint: string

    private hasOrder: boolean

    constructor(type: Type, endPoint: string) {
        this.hasOrder = false;
        this.type = type;
        this.endpoint = endPoint;
    }

    evaluateTradeResponse(response: TradeResponse) {
        const data: TradeData = {
            symbol: response.data?.s,
            price: parseFloat(response.data?.p),
            quantity: 0.001
        }

        if (data.symbol)
            console.log(`\nPar: ${data.symbol}\nPreço: ${data.price}`);

        if (!this.hasOrder && data.price <= 26600) {
            if (this.type == Type.MARKET) { this.newMarketOrder(Side.BUY, data); }
            else { this.newLimitOrder(Side.BUY, data); }

            this.hasOrder = true;
        }
        else if (this.hasOrder && data.price > 26700) {
            if (this.type == Type.MARKET) { this.newMarketOrder(Side.SELL, data); }
            else { this.newLimitOrder(Side.SELL, data); }
            this.hasOrder = false;
        }
    }

    private newMarketOrder = async (side: Side, data: TradeData) => {
        await this.newOrder(side, Type.MARKET, data)
    }

    private newLimitOrder = async (side: Side, data: TradeData) => {
        await this.newOrder(side, Type.LIMIT, data)
    }


    private newOrder = async (side: Side, type: Type, data: TradeData) => {
        const newOrderPayload: INewOrderPayloadBingX = {
            symbol: data.symbol,
            side: side,
            type: type,
            quantity: (side == Side.SELL) ? data.quantity : data?.quantity,
            quoteOrderQty: data?.quoteOrderQty,
            price: (type == Type.LIMIT) ? data.price : undefined,
            recvWindow: 6000
        }

        const uri = this.getURI(newOrderPayload)

        const axiosRequest = new AxiosRequest(uri);
        this.log(data, side, await axiosRequest.post())
    }

    private log(data: TradeData, type: Side, response: any) {
        console.log("\n*** === ***");

        if (type == Side.BUY) {
            console.log("Ordem de compra enviada!");
        } else {
            console.log("Ordem de venda enviada!");
        }

        console.log("__\nDetalhes:");
        console.log(`Par: ${data.symbol}`);
        console.log(`Preço: USD ${data.price}`);
        console.log(`Quantidade: ${data.quantity}`);

        console.log("__\nResultado:");
        console.log(response);
        console.log("=== *** ===\n");
    }

    private getURI(payload: INewOrderPayloadBingX) {
        const parameters = new URLSearchParams(JSON.stringify(payload))
        const timestamp = new Date().getTime()

        parameters.append("timestamp", timestamp.toString())

        const sign = CryptoJS.enc.Hex.stringify(
            CryptoJS.HmacSHA256(parameters.toString(), (process.env.API_KEY + "invalid" || ""))
        )

        parameters.append("signature", sign.toString())

        return `${process.env.API_URL}${this.endpoint}?${parameters.toString()}`;
    }
}