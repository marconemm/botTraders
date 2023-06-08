require("dotenv").config();
const { randomUUID } = require("crypto");
const WebSocket = require("ws");
const zlib = require("zlib");

const ws = new WebSocket(process.env.STREAM_URL);
const textDecoder = new TextDecoder("utf-8");
const subscription = {
	id: randomUUID(),
	reqType: "sub",
	dataType: "BTC-USDT@trade", // or other according with the BingX API documentation.
};

let response;

ws.onopen = event => {
	const { target } = event;

	while (target.readyState == 0)
		console.log("Aguardando conexão com a WS Stream...");

	console.log(`Conectado a WS Stream "${ws.url}"`);

	ws.send(JSON.stringify(subscription));
};

ws.onmessage = async event => {
	zlib.gunzip(event.data, decodeResponse);
};

const decodeResponse = async (err, buffer) => {
	if (err) console.log(err);

	response = JSON.parse(textDecoder.decode(buffer));

	if (response.ping) {
		ws.pong(JSON.stringify({ ...response }));
	} else {
		console.log(response);
	}
};
