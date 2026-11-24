FROM node:25-trixie-slim AS build
RUN npm install --global pnpm@12.4.2
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_BASE_URL=http://localhost:3000
ARG VITE_APP_NAME=AcadFlow
RUN pnpm build

FROM alpine:3.24
RUN apk upgrade --no-cache && apk add --no-cache nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --chmod=755 docker/start-web.sh /usr/local/bin/acadflow-web
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/acadflow-web"]
