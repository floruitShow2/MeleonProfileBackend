FROM node:18.18.0 as builder

ARG MODE=production
ENV MODE=${MODE}

WORKDIR /usr/share/nginx/server

ADD . /usr/share/nginx/server

RUN npm install --registry=https://registry.npm.taobao.org

RUN npm run build

# 指定nginx镜像
FROM nginx:latest

# 复制打包后的代码到nginx容器中
COPY --from=builder /code/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 5603
