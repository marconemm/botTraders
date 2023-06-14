import exp from "constants";

export enum Enums {
    SUB = "sub",
    UNSUBSCRIBE = "unsub",
    BTC_USDT_TRADE = "BTC-USDT@trade",
    ETH_USDT_TRADE = "ETH-USDT@trade",
    UTF_8 = "utf-8",
    CASH_FILENAME = "local-cash.json"
}

export enum Side {
    BUY = "BUY",
    SELL = "SELL",
}

export enum Type {
    MARKET = "MARKET",
    LIMIT = "LIMIT"
}

export enum RestMethod {
    GET = "GET",
    POST = "POST"
}

export enum KlineLimit {
    DAY_BY_MIN = 480,
    DAY_BY_5MIN = 288,
    DAY_BY_10MIN = 144,
    DAY_BY_15MIN = 96,
    DAY_BY_30MIN = 48,
    DAY_BY_1HOUR = 24
}
