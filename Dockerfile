FROM node:lts-alpine3.18
WORKDIR /home/botTraders/
COPY package.json ./
RUN apk add nano
RUN apk add bash
RUN npm install
RUN npm install npm@latest -g
COPY . .

CMD ["npm", "run", "conn:bing"]
