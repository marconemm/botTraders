import { AxiosRequest } from "../connections/axios";
import { Kline } from "./Kline";

class BinanceTrendBot {
    private readonly axiosRequest: AxiosRequest;
    private readonly TICK_SIZE: number;
    private groupedPrices: {}
    private klinesList: Kline[];
    private lowestPrice: number;
    private highestPrice: number;
    private medianPrice: number;
    private priceResistance: number;
    private priceSupport: number;

    constructor(symbol: string, interval: string, limit?: number) {
        if (limit && limit < 1)
            throw new Error("The minimum value to the limit is 1.");

        if (limit && limit > 1000)
            throw new Error("The maximum value to the limit is 1000.");

        let uri = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`
        uri += limit ? `&limit=${limit}` : "";

        this.axiosRequest = new AxiosRequest();
        this.TICK_SIZE = 0.01;
        this.groupedPrices = new Object();
        this.axiosRequest.setURI(uri)
        this.klinesList = new Array<Kline>;

        setInterval(() => this.fetchData(), (1000 * 60) * 15); // refresh the data every 15 minutes.
    }

    async getKlinesList(): Promise<Kline[]> {
        if (!this.klinesList.length)
            await this.fetchData();

        return this.klinesList;
    }

    async getHighestPrice(): Promise<number> {
        if (!this.klinesList.length)
            await this.fetchData();

        const orderedKlines = this.klinesList.sort((k1, k2) => k1.highPrice - k2.highPrice);
        this.highestPrice = parseFloat(
            (orderedKlines[orderedKlines.length - 1].highPrice * .99897).toFixed(2)
        );

        return this.highestPrice;
    }

    async getLowestPrice(): Promise<number> {
        if (!this.klinesList.length)
            await this.fetchData();

        const orderedKlines = this.klinesList.sort((k1, k2) => k1.lowPrice - k2.lowPrice);
        this.lowestPrice = parseFloat((orderedKlines[0].lowPrice * 1.00114).toFixed(2));

        return this.lowestPrice;
    }

    async getMedianPrice() {
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

    async getPriceResistance() {
        if (!this.medianPrice)
            this.medianPrice = await this.getMedianPrice();

        if (Object.keys(this.groupedPrices).length)
            this.groupedPrices = new Object();

        const filteredSupKlines = this.klinesList.filter(kline => kline.highPrice > this.medianPrice)

        filteredSupKlines.map(kline => {
            this.getGroupedTicks(kline);

            return this.groupedPrices;
        });

        return this.getTrendTick(filteredSupKlines.length)
    }

    async getPriceSupport() {
        if (!this.medianPrice)
            this.medianPrice = await this.getMedianPrice();

        if (Object.keys(this.groupedPrices).length)
            this.groupedPrices = new Object();

        const filteredSupKlines = this.klinesList.filter(kline => kline.lowPrice < this.medianPrice)

        filteredSupKlines.map(kline => {
            this.getGroupedTicks(kline);

            return this.groupedPrices;
        });

        return this.getTrendTick(filteredSupKlines.length)
    }

    private getTrendTick(total: number) {
        const arr = Object.keys(this.groupedPrices).map(key => {
            return { tick: key, count: this.groupedPrices[key] }
        });

        return { ...arr.sort((el1, el2) => el1.count - el2.count)[arr.length - 1], total }
    }

    private getGroupedTicks(kline: Kline) {
        const priceOscillation = parseFloat((kline.highPrice - kline.lowPrice).toFixed(2));
        const ticks = parseFloat((priceOscillation * (1 / this.TICK_SIZE)).toFixed(2));
        let count = 1;

        do {
            const tick = (kline.lowPrice + (this.TICK_SIZE * count)).toFixed(2);

            if (!this.groupedPrices[tick])
                this.groupedPrices[tick] = 1;
            else
                this.groupedPrices[tick]++;

        } while (++count < ticks);
    }

    private async fetchData() {
        console.log("Updating klines data...");
        const response = await this.axiosRequest.get();

        if (this.klinesList.length)
            this.klinesList = new Array<Kline>;

        response.forEach(
            (kline: Array<string | number>) => this.klinesList.push(new Kline(kline))
        )
        console.log("Klines data updated.");
    }
}

export { BinanceTrendBot }