import { BinanceTrendBot } from "../models/BinanceTrendBot";


const interval = ((60 / 30) * 24) * 7
const binanceTBot = new BinanceTrendBot("BTCUSDT", "30m", interval);

async function main() {
    // console.log(await binanceTBot.getKlinesList());
    console.log("Máxima:", await binanceTBot.getHighestPrice());
    console.log("Mínima:", await binanceTBot.getLowestPrice());
}

main();