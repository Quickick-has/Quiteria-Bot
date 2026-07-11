# Etapa 1: Build (Instalação das dependências de desenvolvimento e compilação)
FROM node:24-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

# Etapa 2: Produção (Apenas dependências essenciais de execução)
FROM node:24-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apk add --no-cache curl ca-certificates \
	&& ARCH=$(uname -m) \
	&& if [ "$ARCH" = "aarch64" ]; then YTDLP_FILE="yt-dlp_musllinux_aarch64"; else YTDLP_FILE="yt-dlp_musllinux"; fi \
	&& curl -L "https://github.com/yt-dlp/yt-dlp/releases/latest/download/${YTDLP_FILE}" -o /usr/local/bin/yt-dlp \
	&& chmod a+rx /usr/local/bin/yt-dlp
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app ./

USER node
CMD ["node", "app.js"]