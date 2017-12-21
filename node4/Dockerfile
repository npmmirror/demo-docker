FROM node
COPY ./server4 /home/node/app/server4
WORKDIR /home/node/app/server4
RUN npm install --registry=https://registry.npm.taobao.org
#设置时区
RUN apt-get install tzdata \
  && /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo 'Asia/Shanghai' >/etc/timezone \
EXPOSE 3000
CMD ["npm", "start"]