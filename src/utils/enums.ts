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

export enum KLineInterval {
    _1MIN = "1m",
    _5MIN = "5m",
    _10MIN = "10m",
    _15MIN = "15m",
    _30MIN = "30m",
    _1HOUR = "1h"
}

export enum KlineLimit {
    _5H_BY_1MIN = 300,
    DAY_BY_5MIN = 288,
    DAY_BY_10MIN = 144,
    DAY_BY_15MIN = 96,
    DAY_BY_30MIN = 48,
    DAY_BY_1HOUR = 24,
    RESISTANCE_MARGIN = (1 + (0.001 * .89)),
    SUPPORT_MARGIN = (1 - (0.001 * 1.8))
}
