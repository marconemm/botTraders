export interface TradeData {
    price: number;
    symbol: string;
    quantity: string;
}

export interface Subscription {
    id: string,
    reqType: string,
    dataType: string
}

export interface PingResponse {
    ping: string;
    time: string;
}

export interface TradeResponse {
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