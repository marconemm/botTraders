require("dotenv").config();

import WebSocket from "ws";
import { randomUUID } from "crypto";
import { IPingResponse, ISubscription, ITradeResponse } from "../interfaces/interfaces";
import { Enums, Type } from "../utils/enums";
import { BingXBot } from "../models/BingXBot";

const bingXBot = new BingXBot(Type.MARKET, "/openApi/swap/v2/trade/order");
const ws = new WebSocket(process.env.STREAM_URL || "");
const textDecoder = new TextDecoder(Enums.UTF_8);
const subscription: ISubscription = {
	id: randomUUID(),
	reqType: Enums.SUB,
	dataType: Enums.BTC_USDT_TRADE, // or other according with the BingX API documentation.
};
const pingTimeout: NodeJS.Timeout = setTimeout(() => {
	ws.terminate();
}, 31000);

ws.onopen = event => {
	const { target } = event;

	while (target.readyState == 0)
		console.log("Aguardando conexão com a WS Stream...");

	console.log(`Conectado a WS Stream "${ws.url}"`);

	ws.send(JSON.stringify(subscription));
};

ws.onmessage = async (event: WebSocket.MessageEvent) => {
	const zlib = require("zlib");

	zlib.gunzip(event.data, decodeResponse);
};

ws.onclose = () => {
	console.log("Encerrada a conexão com o WSS.");
	process.exit();
}

const decodeResponse = async (err: Error, buffer: BufferSource | undefined) => {
	if (err) throw (err);

	const response: IPingResponse | ITradeResponse = JSON.parse(textDecoder.decode(buffer));

	if ("ping" in response) {
		pingTimeout.refresh();
		console.clear();
		ws.pong(JSON.stringify({ pong: response.ping, time: response.time }));
		console.log(`Sent a Pong to WSS for Ping "${response.ping}"`);

	} else {
		await bingXBot.evaluateTradeResponse(response);
	}
};
