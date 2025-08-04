# Build Stage
FROM node:18 as build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
