FROM node
COPY ./server3 /home/node/app/server3
WORKDIR /home/node/app/server3
RUN npm install --registry=https://registry.npm.taobao.org
CMD ["npm", "start"]

#设置时区
RUN apt-get install tzdata \
  && /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo 'Asia/Shanghai' >/etc/timezone \
EXPOSE 3000