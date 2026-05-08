# ==========================================
# ESTÁGIO 1: Build (Compilação)
# ==========================================
# Usamos a imagem 'slim' para garantir que temos as ferramentas de build 
# mas mantendo o ambiente leve.
FROM node:20-slim AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os ficheiros de definição de dependências primeiro.
# Isto permite que o Docker faça cache das camadas de instalação.
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
FROM node:20-slim

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