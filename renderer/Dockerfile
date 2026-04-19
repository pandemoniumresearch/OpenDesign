FROM node:22-slim

# Install Chrome and FFmpeg on Debian slim
RUN apt-get update && apt-get install -y \
  wget gnupg ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libgtk-3-0 \
  libnspr4 libnss3 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
  libxrender1 libxss1 libxtst6 xdg-utils ffmpeg --no-install-recommends \
  && wget -q -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && dpkg -i /tmp/chrome.deb || apt-get install -f -y \
  && rm /tmp/chrome.deb \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

COPY src/ ./src/
COPY tsconfig.json ./

RUN pnpm build

EXPOSE 3001
ENV PORT=3001

CMD ["node", "dist/renderer.js"]
