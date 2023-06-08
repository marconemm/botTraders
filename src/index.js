require("dotenv").config();//não esqueça de criar o arquivo .env e configurar as variáveis

const axios = require("axios").default;//use .default caso tenha erro com axios
const crypto = require("crypto");
const WebSocket = require("ws");

const ws = new WebSocket(process.env.STREAM_URL + "btcusdt@bookTicker");
let isOpened = false;

ws.onmessage = async (event) => {
    const obj = JSON.parse(event.data);
    console.log("Symbol: " + obj.s);
    console.log("Price: " + obj.a);

    const price = parseFloat(obj.a);
    if (price < 24000 && !isOpened) {
        console.log("Comprar!");
        newOrder("BTCUSDT", "0.001", "BUY");
        isOpened = true;
    }
    else if (price > 25000 && isOpened) {
        console.log("Vender!");
        newOrder("BTCUSDT", "0.001", "SELL");
        isOpened = false;
    }
}

async function newOrder(symbol, quantity, side) {
    //para erros e soluções com essa API, consulte https://www.luiztools.com.br/post/erros-comuns-com-as-apis-da-binance/

    const data = { symbol, quantity, side };
    data.type = "MARKET";
    data.timestamp = Date.now();

    const signature = crypto
        .createHmac("sha256", process.env.SECRET_KEY)
        .update(new URLSearchParams(data).toString())
        .digest("hex");

    data.signature = signature;

    try {
        const result = await axios({
            method: "POST",
            url: process.env.API_URL + "/v3/order?" + new URLSearchParams(data),
            headers: { "X-MBX-APIKEY": process.env.API_KEY }
        });
        console.log(result.data);
    } catch (err) {
        console.log(err);
    }
}
