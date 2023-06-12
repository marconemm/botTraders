export interface ITradeData {
    price: number;
    symbol: string;
    quantity?: number;
    quoteOrderQty?: number;
}

export interface ISubscription {
    id: string,
    reqType: string,
    dataType: string
}

export interface IPingResponse {
    ping: string;
    time: string;
}

export interface ITradeResponse {
    code: number;
    data: {
        E: number;
        T: number;
        e: string;
        m: boolean;
        p: string;
        q: string;
        s: string;
        t: string;
    };
    dataType: string;
    success: boolean;
}

export interface INewOrderPayloadBingX {
    symbol: string; // Trading pair, e.g., BTC-USDT
    side: "BUY" | "SELL";
    type: "MARKET" | "LIMIT";
    timeInForce?: "IOC" | "POC";
    quantity?: number; // Original quantity, e.g., 0.1BTC
    quoteOrderQty?: number; // Quote order quantity, e.g., 100USDT
    price?: number; // Price, e.g., 10000USDT
    recvWindow?: number; // Request valid time window value, Unit: milliseconds
}

export interface IPriceTrend {
    price: number;
    count: number;
    total: number
}
