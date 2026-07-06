FROM node:24-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:5000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 4173

CMD ["npm", "run", "preview"]
