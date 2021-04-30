FROM node:latest AS build
# User
ARG uid=1000
ARG gid=1000
ARG ngenv=prod
RUN groupadd -f -r appuser -g ${gid}
RUN id -u ${uid} &>/dev/null || useradd -u ${uid} -r -g appuser -m -d /home/appuser -s /sbin/nologin -c "Build User" appuser
WORKDIR /app
COPY ["package*.json", "./"]
RUN npm install
COPY . .
RUN [ "npm", "run", "build" ]
COPY ./src/global.css dist/src/global.css
COPY ./images dist/images
# COPY ./config-data dist/config-data

FROM nginx AS runtime
COPY --from=build /app/dist /var/www
COPY /nginx/etc /etc
EXPOSE 80