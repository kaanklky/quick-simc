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
    OUT_DIR=/prepared/public/assets/wasm
RUN (sed -i 's/ multiverse//g' /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null \
     || sed -i 's/ multiverse//g' /etc/apt/sources.list 2>/dev/null || true) \
    && apt-get update -o Acquire::Retries=5 \
    && apt-get install -y --no-install-recommends brotli gzip \
    && rm -rf /var/lib/apt/lists/*
COPY src/public/ /prepared/public/
COPY build-wasm.sh /build-wasm.sh
RUN chmod +x /build-wasm.sh && /build-wasm.sh

FROM nginx:alpine
COPY --from=wasm-builder /prepared/public/ /usr/share/nginx/html/
COPY src/conf/nginx.conf /etc/nginx/templates/default.conf.template
ENV PORT=3000
EXPOSE 3000
