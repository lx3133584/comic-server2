FROM node:14 as builder

WORKDIR /usr/web
COPY . .

RUN npm install \
    && npm run build \
    && wget https://nodejs.org/dist/v14.15.1/node-v14.15.1-linux-x64.tar.xz \
    && tar xf node-v14.15.1-linux-x64.tar.xz -C /opt/


FROM python:slim

COPY --from=builder /opt/node-v14.15.1-linux-x64/ /opt/nodejs
ENV PATH="${PATH}:/opt/nodejs/bin"

WORKDIR /usr/web/crawler
COPY crawler .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

WORKDIR /usr/web/
COPY --from=builder /usr/web/dist ./dist

ENV TIME_ZONE=Asia/Shanghai
ENV NODE_ENV=production

VOLUME ./public

EXPOSE 7001
CMD [ "node", "./dist/main" ]