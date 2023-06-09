require("dotenv").config();

import WebSocket from "ws";
import { randomUUID } from "crypto";
import { PingResponse, Subscription, TradeResponse } from "../models/wss";
import { Enums, Type } from "../utils/enums";
import { BingXBot } from "../models/bots";

const bingXBot = new BingXBot(Type.MARKET, "/openApi/swap/v2/trade/order");
const ws = new WebSocket(process.env.STREAM_URL || "");
const textDecoder = new TextDecoder(Enums.UTF_8);
const subscription: Subscription = {
	id: randomUUID(),
	reqType: Enums.SUB,
	dataType: Enums.BTC_USDT_TRADE, // or other according with the BingX API documentation.
};

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

const decodeResponse = async (err: Error, buffer: BufferSource | undefined) => {
	if (err) throw (err);

	let response: PingResponse | TradeResponse = JSON.parse(textDecoder.decode(buffer));

	if ("ping" in response) {
		response = { ...response } as PingResponse;

		ws.pong(JSON.stringify({ pong: response.ping, time: response.time }));
		console.clear();
		console.log(`Sent a Pong to WSS for Ping "${response.ping}"`);

	} else {
		bingXBot.evaluateTradeResponse(response);
	}
};
