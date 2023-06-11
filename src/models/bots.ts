import { AxiosRequest } from "../connections/axios";
import { IOFile } from "../utils/IOFile";
import { Enums, Side, Type } from "../utils/enums";
import { INewOrderPayloadBingX, TradeData, TradeResponse } from "./wss";
import CryptoJS from "crypto-js";

export class BingXBot {
    private readonly ioFile: IOFile;
    private readonly cashedData: any;
    private readonly type: Type;
    private readonly endpoint: string;

    private hasOrder: boolean

    constructor(type: Type, endPoint: string) {
        this.ioFile = new IOFile(Enums.CASH_FILENAME, Enums.UTF_8);
        this.cashedData = this.ioFile.readFile();
        this.type = type;
        this.endpoint = endPoint;
        this.hasOrder = this.cashedData?.hasOrder || false;
    }

    async evaluateTradeResponse(response: TradeResponse) {
        const data: TradeData = {
            symbol: response.data?.s,
            price: parseFloat(response.data?.p),
            quantity: this.cashedData?.quantity || 0.00000100
        }

        if (data.symbol)
            console.log(`\nPar: ${data.symbol}\nPreço: ${data.price}`);

        if (!this.hasOrder && data.price <= 26600) {
            this.hasOrder = true;
            await this.newOrder(Side.BUY, this.type, data);

        }
        else if (this.hasOrder && data.price > 26700) {
            this.hasOrder = false;
            await this.newOrder(Side.SELL, this.type, data);
        }
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
        const dataToCash: any = { ...newOrderPayload, ...data, hasOrder: this.hasOrder };

        delete dataToCash.recvWindow;
        dataToCash.quoteOrderQty = parseFloat(
            (((dataToCash.price * dataToCash.quantity) * 0.99) - 0.005).toFixed(2)
        ); // cashes 99% of the order placed value minus 1 penny.
        this.ioFile.createFile(dataToCash);

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

        if (response) {
            console.log("__\nResultado:");
            console.log(response);

            if (!response.success) {
                this.hasOrder = false;
                this.ioFile.updateFile({ hasOrder: this.hasOrder });
            }

        } else {
            this.hasOrder = false;
            this.ioFile.updateFile({ hasOrder: this.hasOrder });
        }

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