class Kline {
    openPrice: number;
    closePrice: number;
    highPrice: number;
    lowPrice: number;

    constructor(arr: Array<string | number>) {
        this.openPrice = parseFloat(arr[1].toString());
        this.closePrice = parseFloat(arr[4].toString());
        this.highPrice = parseFloat(arr[2].toString());
        this.lowPrice = parseFloat(arr[3].toString());
    }
}

export { Kline }