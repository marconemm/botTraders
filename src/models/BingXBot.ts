import { AxiosRequest } from "../connections/axios";
import { IOFile } from "../utils/IOFile";
import { Enums, KLineInterval, KlineLimit, Side, Type } from "../utils/enums";
import { IKlinesParameters, INewOrderPayloadBingX, ITradeData, ITradeResponse } from "../interfaces/interfaces";
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
        const parameters: IKlinesParameters = {
            interval: KLineInterval._1MIN, limit: KlineLimit._5H_BY_1MIN
        };

        this.ioFile = new IOFile(Enums.CASH_FILENAME, Enums.UTF_8);
        this.cashedData = this.ioFile.readFile();
        this.type = type;
        this.endpoint = endPoint;
        this.isBought = this.cashedData?.isBought || false;
        this.axiosRequest = new AxiosRequest({ 'X-BX-APIKEY': process.env.API_KEY || "" });
        this.tBotBinanceBTCUSDT = new BinanceTrendBot("BTCUSDT", parameters);
        this.tBotBinanceBTCUSDT.fetchData();
    }

    async evaluateTradeResponse(response: ITradeResponse) {
        const data: ITradeData = {
            symbol: response.data?.s,
            price: parseFloat(response.data?.p),
            quantity: this.cashedData.quantity || 0.001
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
            if (this.isToBuy(data.price)) {
                this.isBought = true;
                await this.newOrder(Side.BUY, this.type, data);
            }

            else if (this.isToSell(data.price)) {
                this.isBought = false;
                await this.newOrder(Side.SELL, this.type, data);
            }
        }

    }

    private isToBuy(currPrice: number): boolean {
        const isPriceUnderSupport = currPrice <= this.currSupport;
        const isToBuy: boolean = isPriceUnderSupport && !this.isBought;

        return isToBuy;
    }

    private isToSell(currPrice: number): boolean {
        const isPriceOverResistance = currPrice > this.currResistance;
        const isToSell: boolean = isPriceOverResistance && this.isBought;

        return isToSell;
    }

    private newOrder = async (side: Side, type: Type, data: ITradeData) => {
        const newOrderPayload: INewOrderPayloadBingX = {
            symbol: data.symbol,
            side: side,
            type: type,
            quantity: (side == Side.SELL) ? data.quantity : undefined,
            quoteOrderQty: (side == Side.BUY) ? this.cashedData.quoteOrderQty : undefined,
            price: (type == Type.LIMIT) ? data.price : undefined
        }

        const uri = this.getURI(newOrderPayload)
        const dataToCash: any = { ...newOrderPayload, ...data, isBought: this.isBought };

        this.ioFile.createFile(dataToCash);
        this.axiosRequest.setURI(uri);
        this.log(data, side, await this.axiosRequest.post())
    }

    private log(data: ITradeData, type: Side, response: any) {
        const txtType = (type == Side.BUY) ? "COMPRA" : "VENDA";

        console.log("\n*** === ***");
        console.log(`Ordem de ${txtType} enviada!`);
        console.log("__\nDetalhes:");
        console.log(`Par: ${data.symbol}`);
        console.log(`Preço: USD ${data.price}`);
        console.log(`Quantidade: ${data.quantity}BTC`);

        if (response) {
            console.log("__\nResposta da corretora:");
            console.log(response);

            if ((response.code == 0)) { // The code 0 means success:
                const { data } = response;
                const quoteOrderQty = parseFloat(data.cummulativeQuoteQty).toFixed(2);
                const quantity = parseFloat(data.executedQty);

                this.ioFile.updateFile(
                    {
                        quantity: quantity,
                        quoteOrderQty: parseFloat(quoteOrderQty) - 0.01,
                        time: new Date(data.transactTime)
                    }
                );
            }
            else {
                this.isBought = false;
                this.ioFile.updateFile({ isBought: false });
            }
        }

        console.log("=== *** ===\n");
    }

    private getURI(payload: INewOrderPayloadBingX) {
        let parameters = "";

        for (const key in payload)
            if (payload[key])
                parameters += `${key}=${payload[key]}&`;

        parameters += `timestamp=${new Date().getTime()}`;


        const sign = CryptoJS.enc.Hex.stringify(
            CryptoJS.HmacSHA256(parameters.toString(), (process.env.API_SECRET || "(invalid)"))
        );

        parameters += `&signature=${sign}`;

        return `${process.env.API_URL}${this.endpoint}?${parameters.toString()}`;
    }
}

export { BingXBot }