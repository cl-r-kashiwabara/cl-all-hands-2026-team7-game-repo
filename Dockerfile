FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@latest

WORKDIR /workspace

EXPOSE 5173

CMD ["sh", "-lc", "pnpm install && pnpm dev"]
