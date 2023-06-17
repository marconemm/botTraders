import { AxiosRequest } from "../connections/axios";
import { IOFile } from "../utils/IOFile";
import { Enums, KLineInterval, KlineLimit, Side, Type } from "../utils/enums";
import {
    ICashedData,
    IKlinesParameters,
    INewOrderPayloadBingX,
    ITradeData,
    ITradeResponse
} from "../interfaces/interfaces";
import CryptoJS from "crypto-js";
import { BinanceTrendBot } from "./BinanceTrendBot";

class BingXBot {
    private readonly ioFile: IOFile;
    private readonly cashedData: ICashedData;
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
        this.isBought = this.cashedData.isBought;
        this.axiosRequest = new AxiosRequest({ 'X-BX-APIKEY': process.env.API_KEY || "" });
        this.tBotBinanceBTCUSDT = new BinanceTrendBot("BTCUSDT", parameters);
        this.tBotBinanceBTCUSDT.fetchData();
    }

    async evaluateTradeResponse(response: ITradeResponse) {
        const tradeData: ITradeData = {
            symbol: response.data?.s,
            price: parseFloat(response.data?.p),
            quantity: this.cashedData.quantity,
            quoteOrderQty: this.cashedData.quoteOrderQty
        }

        if (tradeData.symbol) {
            this.currResistance = this.tBotBinanceBTCUSDT.getCurrResistance();
            this.currSupport = this.tBotBinanceBTCUSDT.getCurrSupport();

            console.log(`\nPar: ${tradeData.symbol}`);
            console.log(`Resistência: ${this.currResistance}`);
            console.log(`Preço atual: ${tradeData.price}`);
            console.log(`Suporte: ${this.currSupport}`);
        }

        if (tradeData.price) {
            if (this.isToBuy(tradeData.price)) {
                this.isBought = true;
                await this.newOrder(Side.BUY, this.type, tradeData);
            }

            else if (this.isToSell(tradeData.price)) {
                this.isBought = false;
                await this.newOrder(Side.SELL, this.type, tradeData);
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
        let isToSell: boolean = isPriceOverResistance && this.isBought;

        isToSell = isToSell && currPrice > this.cashedData.price * 1.0015;

        return isToSell;
    }

    private newOrder = async (side: Side, type: Type, tradeData: ITradeData) => {
        const history: ICashedData[] = [...this.cashedData.history];
        delete this.cashedData.history;

        const newOrderPayload: INewOrderPayloadBingX = {
            symbol: tradeData.symbol,
            side: side,
            type: type,
            quantity: (side == Side.SELL) ? tradeData.quantity : undefined,
            quoteOrderQty: (side == Side.BUY) ? tradeData.quoteOrderQty : undefined,
            price: (type == Type.LIMIT) ? tradeData.price : undefined
        }

        const uri = this.getURI(newOrderPayload);
        history.unshift(this.cashedData);
        const dataToCash: ICashedData = {
            ...newOrderPayload,
            ...tradeData,
            isBought: this.isBought,
            history
        };

        this.ioFile.createFile(dataToCash);
        this.axiosRequest.setURI(uri);
        this.log(tradeData, side, await this.axiosRequest.post())
    }

    private log(tradeData: ITradeData, side: Side, response: any) {
        const txtType = (side == Side.BUY) ? "COMPRA" : "VENDA";

        console.log("\n*** === ***");
        console.log(`Ordem de ${txtType} enviada!`);
        console.log("__\nDetalhes:");
        console.log(`Par: ${tradeData.symbol}`);
        console.log(`Preço: USD ${tradeData.price}`);
        console.log(`Quantidade: ${tradeData.quantity}BTC`);

        if (response) {
            console.log("__\nResposta da corretora:");
            console.log(response);

            if ((response.code == 0)) { // The code 0 means success:
                const savedData: ICashedData = this.ioFile.readFile();
                const { data: responseData } = response;
                const quoteOrderQty = parseFloat(responseData.cummulativeQuoteQty).toFixed(2);

                savedData.history.forEach((el: ICashedData) => delete el.isBought);
                savedData.quantity = parseFloat(responseData.executedQty);
                savedData.quoteOrderQty = parseFloat(quoteOrderQty) - 0.01;
                this.ioFile.updateFile({ ...savedData, time: new Date(responseData.transactTime) });

            } else {
                if (side == Side.BUY) {
                    this.isBought = false;
                    this.ioFile.updateFile({ isBought: false });
                } else {
                    this.isBought = true;
                    this.ioFile.updateFile({ isBought: true });
                }
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