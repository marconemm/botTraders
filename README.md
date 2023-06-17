# BingX Spot Bot

Bot destinado ao monitoramento do mercado de cripto ativos e com a capacidade de enviar ordens de compra ou venda, de acordo com os parâmetros inseridos em sua inicialização.

## O Primeiro Projeto

### binance-spot

Projeto de bot para Binance Spot (dia 1)

## Detalhes sobre o BingX Spot Bot

- É o resultado de um fork do primeiro projeto apresentado na **Imersão BotDev 2023**, realizada nos dias **05 a 11 de junho de 2023**.
- O bot está inicialmente configurado para fazer uma leitura inicial das velas de 1min das ultimas 5h, calcular a resistência e suporte do período e repetir essa análise a cada 15 minutos.
- Caso o valor atual do ativo atinja a resistência, uma ordem de venda 0.001 (ou o valor presente no campo _"quantity"_ do arquivo _"local-cash.json"_)
- O par analisado é o **"Bitcoin x Dólares"**

## Requisitos:

- Node v18.15.0+ [(Node.js)](https://nodejs.org/en)

## Como executar?

1. Clone este repositório;
2. abra a pasta onde o mesmo foi clonado;
3. configure um arquivo _".env"_ conforme o exemplo presente no arquivo _".env.example"_;
4. informe os valores de **API_KEY**, **API_SECRET**, **AMOUNT_USD** e **AMOUNT_COIN** ;
5. abra o seu terminal na pasta onde o mesmo foi clonado este repositório;
6. execute o comando `npm install`; e
7. execute o comando `npm conn:bing`.

## Configurando o "local-cash.json"

Este arquivo é criado automaticamente pelo bot durante a execução da primeira ordem. Mas caso queiras configurá-lo manualmente, insira o seguinte conteúdo no mesmo:

```json
{
	"symbol": "BTC-USDT",
	"side": "SELL",
	"type": "MARKET",
	"quantity": 0.016,
	"price": 25604.26,
	"isBought": false,
	"history": []
}
```

### Links úteis:

- [Documentação da API BingX](https://bingx.com/en-us/account/api/)

## Créditos ao autor da Imersão BotDev 2023:

1. Siga-o nas redes sociais: https://about.me/luiztools
2. Telegram: https://t.me/luiznews
