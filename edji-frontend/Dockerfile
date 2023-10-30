FROM node:18

WORKDIR /opt/edji-frontend
COPY package.json .
RUN yarn install
RUN npm i -g vite
COPY . .
ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080
# ENV NODE_OPTIONS=--inspect=0.0.0.0:9229
CMD yarn dev