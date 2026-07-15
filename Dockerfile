FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json sequelize.config.cjs .sequelizerc ./
COPY src ./src
COPY migrations ./migrations
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=development
ENV TZ=America/Argentina/Buenos_Aires

RUN apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/America/Argentina/Buenos_Aires /etc/localtime \
  && echo "America/Argentina/Buenos_Aires" > /etc/timezone

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build
COPY migrations ./migrations
COPY sequelize.config.cjs .sequelizerc ./
COPY public/uploads ./public/uploads
RUN mkdir -p public/uploads

EXPOSE 3002

CMD ["node", "build/index.js"]
