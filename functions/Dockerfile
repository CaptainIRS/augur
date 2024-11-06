FROM node:20-alpine

RUN apk add --no-cache libc6-compat

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json /usr/src/app
RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && npm install \
    && apk del .gyp

COPY . /usr/src/app

EXPOSE 8545

CMD ["node", "functions-testnet.js"]
