FROM node:20-alpine AS builder
ARG SERVICE_NAME
WORKDIR /app

COPY shared/ ./shared/
COPY ${SERVICE_NAME}/ ./${SERVICE_NAME}/

WORKDIR /app/${SERVICE_NAME}
RUN npm install
RUN npm run build

FROM node:20-alpine
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}
WORKDIR /app

COPY --from=builder /app/${SERVICE_NAME}/dist ./dist
COPY --from=builder /app/${SERVICE_NAME}/node_modules ./node_modules
COPY --from=builder /app/${SERVICE_NAME}/package*.json ./

EXPOSE 3000
CMD ["sh", "-c", "node dist/${SERVICE_NAME}/src/main.js"]