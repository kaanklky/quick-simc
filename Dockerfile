FROM emscripten/emsdk:latest AS wasm-builder
ARG SIMC_BRANCH=midnight
ENV SIMC_BRANCH=${SIMC_BRANCH}
ENV SIMC_DIR=/simc
ENV BUILD_DIR=/simc/build-wasm
ENV OUT_DIR=/wasm-out
ENV SKIP_NPM=1
RUN (sed -i 's/ multiverse//g' /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null \
     || sed -i 's/ multiverse//g' /etc/apt/sources.list 2>/dev/null || true) \
    && apt-get update -o Acquire::Retries=5 \
    && apt-get install -y --no-install-recommends brotli gzip \
    && rm -rf /var/lib/apt/lists/*
COPY build-wasm.sh /build-wasm.sh
RUN chmod +x /build-wasm.sh && /build-wasm.sh

FROM node:22-bookworm-slim
WORKDIR /app
COPY src/package.json src/package-lock.json ./
RUN npm ci --omit=dev
COPY src/server.js ./
COPY src/public/ ./public/
COPY --from=wasm-builder /wasm-out/ ./public/assets/wasm/
ENV NODE_ENV=production
ENV PORT=3000
ENV WEB_ACCESS_CODE=
EXPOSE ${PORT}
USER node
CMD ["node", "server.js"]
