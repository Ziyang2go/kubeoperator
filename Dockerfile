FROM node:8.6.0
WORKDIR /usr/src/app

COPY . .
RUN yarn install

CMD ["node","--experimental-modules","src"]
