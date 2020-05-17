FROM node:12.16.2-alpine
MAINTAINER ismak89@icloud.com
RUN mkdir -p /app/volume
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN npm install serve -g
RUN yarn global add serve --silent
RUN yarn install --silent
COPY . .
RUN npm run build
CMD ["serve", "build"]