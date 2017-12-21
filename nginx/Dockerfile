FROM nginx
#维护者信息
LABEL maintainer="sunzhen <stomz@163.com>"
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./demo1 /apps/demo1
COPY ./demo2 /apps/demo2
COPY ./demo3 /apps/demo3
COPY ./demo4 /apps/demo4

#设置时区
RUN apt-get install tzdata \
  && /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo 'Asia/Shanghai' >/etc/timezone \