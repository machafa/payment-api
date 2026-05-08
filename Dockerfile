# ==========================================
# ESTÁGIO 1: Build (Compilação)
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app
COPY package*.json ./

# Instalação limpa das dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar todo o código fonte para o container
COPY . .

# Converter TypeScript para JavaScript (gera a pasta /dist)
RUN npm run build

# ==========================================
# ESTÁGIO 2: Runtime (Execução)
# ==========================================
# Iniciamos uma nova imagem limpa, sem o código fonte ou ferramentas de build
FROM node:20-alpine

WORKDIR /app

# Definir ambiente como produção para otimizações de performance
ENV NODE_ENV=production

# Copiar ficheiros de dependências novamente para instalar apenas o necessário para rodar
COPY package*.json ./

# Instalar APENAS as dependências de produção (ignora devDependencies)
RUN npm ci --only=production

# Copiar apenas os ficheiros compilados (.js) do estágio anterior
# Nota: Garante que no teu tsconfig.json o outDir é "dist"
COPY --from=builder /app/dist ./dist

# Segurança: Criar e usar um utilizador não-root (padrão da imagem node)
# Isto evita que a app tenha privilégios de administrador no cluster
USER node

# Expor a porta que a tua aplicação utiliza (padrão 3000)
EXPOSE 3000

# Comando para iniciar a aplicação
# Nota: Ajusta para 'dist/index.js' se o teu ficheiro principal não for 'app.js'
CMD ["node", "dist/app.js"]