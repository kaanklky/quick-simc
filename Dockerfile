FROM node:22-bookworm-slim AS base

FROM base AS simc-builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake g++ make git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ARG SIMC_BRANCH=midnight
RUN git clone --depth 1 --branch ${SIMC_BRANCH} https://github.com/simulationcraft/simc.git /simc
WORKDIR /simc/build
RUN cmake -DBUILD_GUI=OFF -DSC_NO_NETWORKING=ON .. \
    && make -j$(nproc) \
    && strip simc

FROM base
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY src/package.json src/package-lock.json ./
RUN npm ci --omit=dev
COPY src/server.js ./
COPY src/public/ ./public/
COPY --from=simc-builder /simc/build/simc ./bin/simc
RUN mkdir -p tmp && chown node:node tmp
ENV NODE_ENV=production
ENV PORT=3000
ENV WEB_ACCESS_CODE=
EXPOSE ${PORT}
USER node
CMD ["node", "server.js"]
