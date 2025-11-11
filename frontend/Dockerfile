FROM node:20-slim

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY .env* ./       

RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]