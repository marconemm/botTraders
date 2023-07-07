FROM node:lts-alpine3.18
WORKDIR /home/botTraders/
COPY package.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "conn:bing"]
