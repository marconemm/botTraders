import { BinanceTrendBot } from "../models/BinanceTrendBot";


const interval = ((60 / 5) * 24) * 1
const binanceTBot = new BinanceTrendBot("BTCUSDT", "5m", interval);

async function main() {
    console.log("Máxima:", await binanceTBot.getHighestPrice());
    console.log("Média:", await binanceTBot.getMedianPrice());
    console.log("Mínima:", await binanceTBot.getLowestPrice());
    console.log("Resistência:", await binanceTBot.getPriceResistance());
    console.log("Suporte:", await binanceTBot.getPriceSupport());
}

main();