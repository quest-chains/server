FROM node:18.16.0 as base

WORKDIR /usr/src/app

COPY yarn.lock ./yarn.lock
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY src ./src

ENV NODE_ENV $NODE_ENV
ENV WEB3_STORAGE_KEY $WEB3_STORAGE_KEY
ENV WEB3_STORAGE_PROOF $WEB3_STORAGE_PROOF
ENV WEB3_STORAGE_DID $WEB3_STORAGE_DID

RUN yarn install --frozen-lockfile

EXPOSE 5000

CMD ["yarn", "start"]
