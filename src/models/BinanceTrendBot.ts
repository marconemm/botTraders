import { AxiosRequest } from "../connections/axios";
import { Kline } from "./Kline";

class BinanceTrendBot {
    private readonly axiosRequest: AxiosRequest;
    private readonly klinesList: Kline[];
    private currPriceResistance: number;
    private currPriceSupport: number;

    constructor(symbol: string, interval: string, limit?: number) {
        if (limit && limit < 1)
            throw new Error("The minimum value to the limit is 1.");

        if (limit && limit > 1000)
            throw new Error("The maximum value to the limit is 1000.");

        let uri = `https://api4.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`
        uri += limit ? `&limit=${limit}` : "";

        this.axiosRequest = new AxiosRequest();
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

        return orderedKlines[orderedKlines.length - 1].highPrice;
    }

    async getLowestPrice(): Promise<number> {
        if (!this.klinesList.length)
            await this.fetchData();

        const orderedKlines = this.klinesList.sort((k1, k2) => k1.lowPrice - k2.lowPrice);

        return orderedKlines[0].lowPrice;
    }

    private async fetchData() {
        console.log("Updating klines data...");
        const response = await this.axiosRequest.get();

        response.forEach(
            (kline: Array<string | number>) => this.klinesList.push(new Kline(kline))
        )
        console.log("Klines data updated.");
    }
}

export { BinanceTrendBot }