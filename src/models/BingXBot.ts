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

    private isBought: boolean
    private currResistance: number;
    private currSupport: number;

    constructor(type: Type, endPoint: string) {
        const interval = 60; // to 5m:  ((60 / 5) * 24) * 1

        this.ioFile = new IOFile(Enums.CASH_FILENAME, Enums.UTF_8);
        this.cashedData = this.ioFile.readFile();
        this.type = type;
        this.endpoint = endPoint;
        this.isBought = this.cashedData?.isBought || false;
        this.axiosRequest = new AxiosRequest({ 'X-BX-APIKEY': process.env.API_KEY || "" });
        this.tBotBinanceBTCUSDT = new BinanceTrendBot("BTCUSDT", "1h", interval);
        this.tBotBinanceBTCUSDT.fetchData();
    }

    async evaluateTradeResponse(response: ITradeResponse) {
        const data: ITradeData = {
            symbol: response.data?.s,
            price: parseFloat(response.data?.p),
            quantity: 0.001
        }

        if (this.cashedData.quantity) {
            // Correct the data quantity to 99,8% minus 1 sat of original data quantity:
            const preciseQty = ((this.cashedData.quantity * 0.998) - 0.00000001).toFixed(8)

            data.quantity = parseFloat(preciseQty);
        }

        if (data.symbol) {
            this.currResistance = this.tBotBinanceBTCUSDT.getCurrResistance();
            this.currSupport = this.tBotBinanceBTCUSDT.getCurrSupport();

            console.log(`\nPar: ${data.symbol}`);
            console.log(`Resistência: ${this.currResistance}`);
            console.log(`Preço atual: ${data.price}`);
            console.log(`Suporte: ${this.currSupport}`);
        }

        if (data.price) {
            if (this.isToBuy(data.price))
                await this.newOrder(Side.BUY, this.type, data);

            else if (this.isToSell(data.price))
                await this.newOrder(Side.SELL, this.type, data);
        }

    }

    private isToBuy(currPrice: number): boolean {
        const buyPrice = (1 - (0.3 / 100)) * this.currSupport;
        const isPriceUnderSupport = currPrice <= buyPrice;
        const isToBuy: boolean = isPriceUnderSupport && !this.isBought;

        this.isBought = isToBuy;

        return isToBuy;
    }

    private isToSell(currPrice: number): boolean {
        const sellPrice = (1 + (0.05 / 100)) * this.currResistance;
        const isPriceOverResistance = currPrice > sellPrice;
        const isToSell: boolean = isPriceOverResistance && this.isBought;

        this.isBought = isToSell;

        return isToSell;
    }

    private newOrder = async (side: Side, type: Type, data: ITradeData) => {
        const newOrderPayload: INewOrderPayloadBingX = {
            symbol: data.symbol,
            side: side,
            type: type,
            quantity: data.quantity,
            quoteOrderQty: this.cashedData.quoteOrderQty,
            price: (type == Type.LIMIT) ? data.price : undefined
        }

        const uri = this.getURI(newOrderPayload)
        const dataToCash: any = { ...newOrderPayload, ...data, isBought: this.isBought };

        dataToCash.quoteOrderQty = parseFloat(
            ((dataToCash.price * dataToCash.quantity)).toFixed(2)
        ); // save in the cash, the order placed value.
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
        console.log(`Quantidade: ${data.quantity}BTC`);

        if (response) {
            console.log("__\nResultado:");
            console.log(response);

            if (!response.success) {
                this.isBought = false;
                this.ioFile.updateFile({ isBought: this.isBought });
            }

        } else {
            this.isBought = false;
            this.ioFile.updateFile({ isBought: this.isBought });
        }

        console.log("=== *** ===\n");
    }

    private getURI(payload: INewOrderPayloadBingX) {
        const parameters = new URLSearchParams(JSON.stringify(payload))
        const timestamp = new Date().getTime()

        parameters.append("timestamp", timestamp.toString())

        const sign = CryptoJS.enc.Hex.stringify(
            CryptoJS.HmacSHA256(parameters.toString(), (process.env.API_KEY || "(invalid)"))
        )

        parameters.append("signature", sign.toString())

        return `${process.env.API_URL}${this.endpoint}?${parameters.toString()}`;
    }
}

export { BingXBot }