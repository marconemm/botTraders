FROM node:lts-alpine3.18
WORKDIR /home/botTraders/
COPY package.json ./
COPY . .
RUN npm install
RUN apk add nano
RUN apk add bash
RUN mv /home/botTraders/.env.example /home/botTraders/.env
