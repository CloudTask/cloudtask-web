FROM node:8.10-alpine

MAINTAINER Selena Wu <Selena.X.Wu@newegg.com>

ADD ./dist /cloudtask-web

WORKDIR /cloudtask-web

EXPOSE 8091

CMD ["node", "server/index.js"]

