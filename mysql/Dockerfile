FROM mysql
#维护者信息
LABEL maintainer="sunzhen <stomz@163.com>"

#将所需文件放到容器中
COPY ./setup /docker-entrypoint-initdb.d
COPY ./conf/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf

#设置时区
RUN apt-get install tzdata \
  && /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo 'Asia/Shanghai' >/etc/timezone \
