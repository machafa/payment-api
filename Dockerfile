# STAGE 1: build the application 
#using the node.js image thats most stable and most recent
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./

#install dependencies
RUN npm ci 
COPY . .

#turn all ts to js
RUN npm run build


# STAGE 2: run the application
#using a smaller and cleaner image for execution
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev

#copy the built js files from the builder stage
COPY --from=builder /app/dist ./dist

#start the application
USER node
#expose the port the app will run on
EXPOSE 3000

#command to run the application
CMD ["node", "dist/app.js"]