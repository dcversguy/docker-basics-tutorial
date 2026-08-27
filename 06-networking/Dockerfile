FROM node:20-alpine

ARG APP_NAME=app
ARG TARGET_HOST=localhost
ARG TARGET_PORT=4000

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY app.js ./

USER node

CMD ["node", "app.js"]
