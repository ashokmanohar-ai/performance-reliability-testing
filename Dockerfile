FROM node:22.18.0-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY demo-app/package.json demo-app/package.json
RUN npm ci
COPY demo-app demo-app
RUN npm run build --workspace demo-app && npm prune --omit=dev

FROM node:22.18.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
RUN addgroup -S acme && adduser -S acme -G acme
COPY --from=build --chown=acme:acme /workspace/package.json ./package.json
COPY --from=build --chown=acme:acme /workspace/node_modules ./node_modules
COPY --from=build --chown=acme:acme /workspace/demo-app/package.json ./demo-app/package.json
COPY --from=build --chown=acme:acme /workspace/demo-app/dist ./demo-app/dist
USER acme
EXPOSE 3000
CMD ["node", "demo-app/dist/server.js"]
