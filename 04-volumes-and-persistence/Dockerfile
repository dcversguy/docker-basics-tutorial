# ============================================================
# 04 - Volumes and Persistence
# ============================================================
#
# This Dockerfile creates a simple file-based note-taking app.
# Notes are stored in /data inside the container.
# Without a volume, notes disappear when the container is removed.
# With a volume, notes persist across container restarts and removals.
# ============================================================

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY app.js ./

# VOLUME declares that /data is intended to be a mount point.
# Docker will create an anonymous volume here if the user
# doesn't specify one — ensuring data isn't lost accidentally.
VOLUME ["/data"]

EXPOSE 3000

USER node

CMD ["node", "app.js"]
