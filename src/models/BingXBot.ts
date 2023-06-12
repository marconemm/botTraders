import { AxiosRequest } from "../connections/axios";
import { IOFile } from "../utils/IOFile";
import { Enums, Side, Type } from "../utils/enums";
import { INewOrderPayloadBingX, ITradeData, ITradeResponse } from "../interfaces/interfaces";
import CryptoJS from "crypto-js";
import { BinanceTrendBot } from "./BinanceTrendBot";

class BingXBot {
    private readonly ioFile: IOFile;
    private readonly cashedData: any;
    private readonly type: Type;
    private readonly endpoint: string;
    private readonly axiosRequest: AxiosRequest;
    private readonly tBotBinanceBTCUSDT: BinanceTrendBot;

    private hasOrder: boolean
    private currResistance: number;
    private currSupport: number;

    constructor(type: Type, endPoint: string) {
        const interval = ((60 / 5) * 24) * 1;

        this.ioFile = new IOFile(Enums.CASH_FILENAME, Enums.UTF_8);
        this.cashedData = this.ioFile.readFile();
        this.type = type;
        this.endpoint = endPoint;
        this.hasOrder = this.cashedData?.hasOrder || false;
        this.axiosRequest = new AxiosRequest({ 'X-BX-APIKEY': process.env.API_KEY || "" });
        this.tBotBinanceBTCUSDT = new BinanceTrendBot("BTCUSDT", "5m", interval);
        this.tBotBinanceBTCUSDT.fetchData();
    }

    async evaluateTradeResponse(response: ITradeResponse) {
        const data: ITradeData = {
            symbol: response.data?.s,
            price: parseFloat(response.data?.p),
            quantity: this.cashedData?.quantity || 0.00001000
        }

        if (data.symbol) {
            this.currResistance = await this.tBotBinanceBTCUSDT.getCurrResistance();
            this.currSupport = await this.tBotBinanceBTCUSDT.getCurrSupport();

            console.log(`\nPar: ${data.symbol}\nPreço atual: ${data.price}`);
            console.log(`Resistência: ${this.currResistance}`);
            console.log(`Suporte: ${this.currSupport}`);
        }

        if (this.isToBuy(data.price))
            await this.newOrder(Side.BUY, this.type, data);

        else if (this.isToSell(data.price))
            await this.newOrder(Side.SELL, this.type, data);

    }

    private isToBuy(currPrice: number): boolean {
        const isPriceUnderSupport = currPrice <= this.currSupport;
        let isToBuy: boolean = !this.hasOrder;

        isToBuy = isToBuy && isPriceUnderSupport;

        this.hasOrder = isToBuy;

        return isToBuy;
    }

    private isToSell(currPrice: number): boolean {
        const isPriceOverResistance = currPrice > this.currResistance;
        let isToSell: boolean = !this.hasOrder;

        isToSell = isToSell && isPriceOverResistance;

        this.hasOrder = !isToSell;

        return isToSell;
    }

    private newOrder = async (side: Side, type: Type, data: ITradeData) => {
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

        this.axiosRequest.setURI(uri);
        this.log(data, side, await this.axiosRequest.post())
    }

    private log(data: ITradeData, type: Side, response: any) {
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

export { BingXBot }