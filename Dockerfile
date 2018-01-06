FROM docker.neg/base/nodejs:6.9.2
MAINTAINER Selena Wu <Selena.X.Wu@newegg.com>

ADD . /cloud-task_new

WORKDIR /cloud-task_new

EXPOSE 8091

CMD ["node", "src/server/index.js"]

