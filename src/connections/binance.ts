import { BinanceTrendBot } from "../models/BinanceTrendBot";


const interval = ((60 / 5) * 24) * 1
const trendBotBinanceBTCUSDT = new BinanceTrendBot("BTCUSDT", "5m", interval);

async function main() {
    await trendBotBinanceBTCUSDT.fetchData();

}

main();