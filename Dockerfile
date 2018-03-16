FROM docker.neg/base/nodejs:6.9.2
MAINTAINER Selena Wu <Selena.X.Wu@newegg.com>

ADD . /cloudtask-open-source

WORKDIR /cloudtask-open-source

EXPOSE 8091

CMD ["node", "src/server/index.js"]

