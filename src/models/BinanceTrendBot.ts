import { AxiosRequest } from "../connections/axios";
import { IPriceTrend } from "../interfaces/interfaces";
import { Kline } from "./Kline";

class BinanceTrendBot {
    private readonly axiosRequest: AxiosRequest;
    private readonly TICK_SIZE: number;
    private readonly SYMBOL: string;
    private groupedPrices: {}
    private klinesList: Kline[];
    private lowestPrice: number;
    private highestPrice: number;
    private medianPrice: number;

    constructor(symbol: string, interval: string, limit?: number) {
        if (limit && limit < 1)
            throw new Error("The minimum value to the limit is 1.");

        if (limit && limit > 1000)
            throw new Error("The maximum value to the limit is 1000.");

        let uri = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`
        uri += limit ? `&limit=${limit}` : "";

        this.axiosRequest = new AxiosRequest();
        this.TICK_SIZE = 0.01;
        this.SYMBOL = symbol;
        this.groupedPrices = new Object();
        this.axiosRequest.setURI(uri)
        this.klinesList = new Array<Kline>;

        setInterval(() => this.fetchData(), (1000 * 60) * 15); // refresh the data every 15 minutes.
    }

    async fetchData() {
        console.log("Updating klines data...");
        const response = await this.axiosRequest.get();

        this.resetData();
        response.forEach(
            (kline: Array<string | number>) => this.klinesList.push(new Kline(kline))
        )
        console.log("Klines data updated.");

        this.log();
    }

    private async log() {
        const separator = "---------------------------------------------------";

        console.log(`\n${separator}`);
        console.log(`Trend Bot (${this.SYMBOL}), log:`);
        console.log(separator);
        console.log("Máxima:", await this.getHighestPrice());
        console.log("Média:", await this.getMedianPrice());
        console.log("Mínima:", await this.getLowestPrice());
        console.log("Resistência:", await this.getPriceResistance());
        console.log("Suporte:", await this.getPriceSupport());
        console.log(`${separator}\n`);
    }

    private resetData() {
        if (Object.keys(this.groupedPrices).length)
            this.groupedPrices = new Object();

        if (this.klinesList.length)
            this.klinesList = new Array<Kline>;

        this.lowestPrice = 0;
        this.highestPrice = 0;
        this.medianPrice = 0;
    }

    private async getHighestPrice(): Promise<number> {
        if (!this.klinesList.length)
            await this.fetchData();

        const orderedKlines = this.klinesList.sort((k1, k2) => k1.highPrice - k2.highPrice);
        this.highestPrice = parseFloat(
            (orderedKlines[orderedKlines.length - 1].highPrice * .99897).toFixed(2)
        );

        return this.highestPrice;
    }

    private async getLowestPrice(): Promise<number> {
        if (!this.klinesList.length)
            await this.fetchData();

        const orderedKlines = this.klinesList.sort((k1, k2) => k1.lowPrice - k2.lowPrice);
        this.lowestPrice = parseFloat((orderedKlines[0].lowPrice * 1.00114).toFixed(2));

        return this.lowestPrice;
    }

    private async getMedianPrice() {
        if (!this.lowestPrice)
            this.lowestPrice = await this.getLowestPrice();

        if (!this.highestPrice)
            this.highestPrice = await this.getHighestPrice();

        this.medianPrice = parseFloat((
            (this.highestPrice - this.lowestPrice) / 2
            + this.lowestPrice).toFixed(2)
        );

        return this.medianPrice;
    }

    private getTrendTick(total: number) {
        const arr = Object.keys(this.groupedPrices).map(key => {
            return { price: key, count: this.groupedPrices[key] }
        });

        const sortedPrice = arr.sort((price1, price2) => {
            return (price1.count - price2.count);
        })[arr.length - 1];

        return { price: parseFloat(sortedPrice.price), count: sortedPrice.count, total }
    }

    private getGroupedTicks(kline: Kline) {
        const priceOscillation = parseFloat((kline.highPrice - kline.lowPrice).toFixed(2));
        const ticks = parseFloat((priceOscillation * (1 / this.TICK_SIZE)).toFixed(2));
        let count = 1;

        do {
            const sortedPrice = (kline.lowPrice + (this.TICK_SIZE * count)).toFixed(2);

            if (!this.groupedPrices[sortedPrice])
                this.groupedPrices[sortedPrice] = 1;
            else
                this.groupedPrices[sortedPrice]++;

        } while (++count < ticks);
    }

    private async getPriceResistance(): Promise<IPriceTrend> {
        if (!this.medianPrice)
            this.medianPrice = await this.getMedianPrice();

        if (Object.keys(this.groupedPrices).length)
            this.groupedPrices = new Object();

        const filteredHighKlines = this.klinesList.filter(kline => kline.highPrice > this.medianPrice)

        filteredHighKlines.map(kline => {
            this.getGroupedTicks(kline);

            return this.groupedPrices;
        });

        const resistance: IPriceTrend = this.getTrendTick(filteredHighKlines.length);

        resistance.price = parseFloat((resistance.price * 0.9995).toFixed(2));

        return resistance;
    }

    private async getPriceSupport(): Promise<IPriceTrend> {
        if (!this.medianPrice)
            this.medianPrice = await this.getMedianPrice();

        if (Object.keys(this.groupedPrices).length)
            this.groupedPrices = new Object();

        const filteredLowKlines = this.klinesList.filter(kline => kline.lowPrice < this.medianPrice)

        filteredLowKlines.map(kline => {
            this.getGroupedTicks(kline);

            return this.groupedPrices;
        });

        const support: IPriceTrend = this.getTrendTick(filteredLowKlines.length);

        support.price = parseFloat((support.price * 0.9995).toFixed(2));

        return support;
    }
}

export { BinanceTrendBot }