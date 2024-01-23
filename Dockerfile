FROM node:18 as base
WORKDIR /usr/src/app

COPY yarn.lock .
COPY package.json .
COPY src ./src
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json

ENV NODE_ENV $NODE_ENV
ENV WEB3_STORAGE_TOKEN $WEB3_STORAGE_TOKEN

RUN yarn install --frozen-lockfile

CMD ["yarn", "start"]
