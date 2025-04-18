
# Build Stage
FROM node:22-alpine AS build
LABEL authors="RichardLee"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html/ai-agent
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]