import { BinanceTrendBot } from "../models/bots";


const interval = ((60 / 30) * 24) * 7
const xxx = new BinanceTrendBot("BTCUSDT", "30m", interval);

xxx.test()