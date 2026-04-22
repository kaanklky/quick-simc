FROM emscripten/emsdk:latest AS wasm-builder
ARG SIMC_BRANCH=midnight
ARG SIMC_REF=
ARG APP_VERSION=dev
ARG WOW_PATCH_NAME=Midnight
ENV SIMC_BRANCH=${SIMC_BRANCH} \
    SIMC_REF=${SIMC_REF} \
    APP_VERSION=${APP_VERSION} \
    WOW_PATCH_NAME=${WOW_PATCH_NAME} \
    ROOT_DIR=/prepared \
    SIMC_DIR=/simc \
    BUILD_DIR=/simc/build-wasm \
    PUBLIC_DIR=/prepared/public \
    OUT_DIR=/prepared/public/assets/wasm \
    SKIP_NPM=1
RUN (sed -i 's/ multiverse//g' /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null \
     || sed -i 's/ multiverse//g' /etc/apt/sources.list 2>/dev/null || true) \
    && apt-get update -o Acquire::Retries=5 \
    && apt-get install -y --no-install-recommends brotli gzip \
    && rm -rf /var/lib/apt/lists/*
COPY src/public/ /prepared/public/
COPY build-wasm.sh /build-wasm.sh
RUN chmod +x /build-wasm.sh && /build-wasm.sh

FROM node:22-bookworm-slim
WORKDIR /app
COPY src/package.json src/package-lock.json ./
RUN npm ci --omit=dev
COPY src/server.js ./
COPY --from=wasm-builder /prepared/public/ ./public/
ENV NODE_ENV=production
ENV PORT=3000
ENV WEB_ACCESS_CODE=
EXPOSE ${PORT}
USER node
CMD ["node", "server.js"]
