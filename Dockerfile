FROM node:lts-alpine3.18
WORKDIR /home/botTraders/
COPY package.json ./
RUN apk add nano
RUN apk add bash
RUN npm install
COPY . .
