import { IKlinesParameters } from "../interfaces/interfaces";
import { BinanceTrendBot } from "../models/BinanceTrendBot";
import { KLineInterval, KlineLimit } from "../utils/enums";


async function main() {
    const parameters: IKlinesParameters = {
        limit: KlineLimit.DAY_BY_15MIN,
        interval: KLineInterval._15MIN
    }
    const trendBotBinanceBTCUSDT = new BinanceTrendBot("BTCUSDT", parameters);

    await trendBotBinanceBTCUSDT.fetchData();
}

main();