import { IKlinesParameters } from "../interfaces/interfaces";
import { BinanceTrendBot } from "../models/BinanceTrendBot";
import { KLineInterval, KlineLimit } from "../utils/enums";


const parameters: IKlinesParameters = {
    limit: KlineLimit.DAY_BY_15MIN,
    interval: KLineInterval._15MIN
}
const trendBotBinanceBTCUSDT = new BinanceTrendBot("BTCUSDT", parameters);

async function main() {
    await trendBotBinanceBTCUSDT.fetchData();

}

main();