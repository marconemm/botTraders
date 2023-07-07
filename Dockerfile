FROM node:lts-alpine3.18
WORKDIR /home/botTraders/
COPY package.json ./
RUN npm install
RUN npm install -g npm # update the NPM to the latest version
COPY . .

CMD ["npm", "run", "conn:bing"]
