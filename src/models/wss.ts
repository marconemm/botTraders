interface TradeData {
    E: number;
    T: number;
    e: string;
    m: boolean;
    p: string;
    q: string;
    s: string;
    t: string;
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
    data: TradeData;
    dataType: string;
    success: boolean;
}