FROM node:20.10.0 as builder

# 设置时区
ENV TZ=Asia/Shanghai \
    DEBIAN_FRONTEND=noninteractive
RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata && rm -rf /var/lib/apt/lists/*

ARG MODE=production
ENV MODE=${NEST_APP_MODE}

WORKDIR /app

ADD . /app

RUN npm install --registry=https://registry.npm.taobao.org

RUN npm run build

# 复制打包后的代码到nginx容器中
COPY --from=builder /code/dist /usr/share/nginx/html

# npm 安装依赖
RUN npm install 
# 打包
RUN npm run build

# 启动服务
CMD npm run start:prod

EXPOSE 3000