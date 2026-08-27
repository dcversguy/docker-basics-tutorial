# ============================================================
# 02 - Simple Node.js Web Application
# ============================================================

# Use the official Node.js 20 image on Alpine for a small footprint
FROM node:20-alpine

# LABEL adds metadata to the image
LABEL maintainer="docker-tutorial"
LABEL description="Simple Node.js web app"

# WORKDIR sets (and creates if needed) the working directory
# inside the container. All subsequent commands run from here.
WORKDIR /app

# COPY the package files first so Docker can cache the
# dependency install layer independently from app code.
COPY package.json ./

# RUN executes a command during the image build.
# We install only production dependencies.
RUN npm install --omit=dev

# COPY the rest of the application source code
COPY app.js ./

# EXPOSE documents which port the app listens on.
# It does NOT actually publish the port — that happens with -p at runtime.
EXPOSE 3000

# Use a non-root user for better security
USER node

# CMD is the default command to run when the container starts
CMD ["node", "app.js"]
