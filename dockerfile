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
	&& curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
	&& chmod a+rx /usr/local/bin/yt-dlp
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app ./

# Execute a aplicação com um usuário sem privilégios de root para maior segurança
USER node
CMD ["node", "app.js"]
