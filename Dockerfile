# syntax=docker/dockerfile:1
FROM node:20-alpine

# diretório de trabalho
WORKDIR /usr/src/app

# copiar package.json e package-lock primeiro para cache de camadas
COPY package*.json ./

# instalar dependências (sem dev)
RUN npm ci --only=production

# copiar o restante do código
COPY . .

# criar usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# comando padrão (a imagem só prepara; docker-compose pode executar comandos específicos)
CMD ["node", "index.js", "--txt"]
