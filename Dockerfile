FROM node:lts
WORKDIR /home/botTraders/
COPY package.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "conn:bing"]
