# 02 — Simple Web Application

> **Goal:** Containerise a Node.js web application and learn port mapping.

---

## What You'll Learn

- Key Dockerfile instructions: `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `USER`
- How Docker layer caching speeds up builds
- How to map container ports to host ports with `-p`
- How to run a container in the background (`-d`)
- How to view logs and stop containers

---

## Project Structure

```
02-simple-app/
├── Dockerfile
├── .dockerignore
├── package.json
└── app.js
```

---

## Dockerfile Walkthrough

```dockerfile
FROM node:20-alpine

LABEL maintainer="docker-tutorial"

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY app.js ./

EXPOSE 3000

USER node

CMD ["node", "app.js"]
```

### Key Instructions Explained

| Instruction | Purpose |
|---|---|
| `FROM node:20-alpine` | Start from Node 20 on Alpine (small base image) |
| `LABEL` | Add metadata (author, description, etc.) |
| `WORKDIR /app` | Set working directory inside the container |
| `COPY package.json ./` | Copy only the manifest first (for caching) |
| `RUN npm install` | Install dependencies as a cached layer |
| `COPY app.js ./` | Copy app code (separate layer for faster rebuilds) |
| `EXPOSE 3000` | Document the port (does not publish it) |
| `USER node` | Run as a non-root user for security |
| `CMD ["node", "app.js"]` | Default startup command |

### Why Copy `package.json` Before the Source Code?

Docker builds images layer by layer. Each instruction creates a new layer that is **cached**. By copying `package.json` and running `npm install` before copying your application code, you ensure that the expensive `npm install` step is only re-run when `package.json` changes — not every time you edit `app.js`.

```
Layer 1: FROM node:20-alpine          (cached, from registry)
Layer 2: WORKDIR /app                 (cached)
Layer 3: COPY package.json            (cached unless package.json changed)
Layer 4: RUN npm install              (cached unless layer 3 changed)
Layer 5: COPY app.js                  (re-run only when app.js changes)
```

---

## Build the Image

```bash
# Run from the 02-simple-app directory
docker build -t simple-app .
```

---

## Run the Container

### Foreground (see logs directly)

```bash
docker run -p 3000:3000 simple-app
```

Open your browser at **http://localhost:3000**

Press `Ctrl+C` to stop.

### Background (detached) mode

```bash
docker run -d -p 3000:3000 --name my-app simple-app
```

The container runs in the background. You'll get a container ID back.

```bash
# Check it's running
docker ps

# View the logs
docker logs my-app

# Follow the logs in real-time
docker logs -f my-app
```

---

## Port Mapping

The `-p` flag maps a **host port** to a **container port**:

```
-p <host-port>:<container-port>
```

Examples:

```bash
# Map host port 3000 → container port 3000
docker run -p 3000:3000 simple-app

# Map host port 8080 → container port 3000
docker run -p 8080:3000 simple-app

# Map to all interfaces (default) vs localhost only
docker run -p 3000:3000 simple-app         # all interfaces
docker run -p 127.0.0.1:3000:3000 simple-app  # localhost only
```

---

## Environment Variables

Pass configuration at runtime using `-e`:

```bash
# Run the app on port 4000 inside the container, mapped to host 4000
docker run -d -p 4000:4000 -e PORT=4000 --name my-app-4000 simple-app
```

---

## Stop and Clean Up

```bash
# Stop the running container
docker stop my-app

# Remove the stopped container
docker rm my-app

# Or stop and remove in one command
docker rm -f my-app
```

---

## Inspecting the Container

```bash
# Open a shell inside the running container
docker exec -it my-app sh

# Inside the container:
ls /app
cat /app/app.js
node --version
exit
```

---

## .dockerignore

The `.dockerignore` file tells Docker which files to **exclude** from the build context:

```
node_modules
npm-debug.log
.env
```

This prevents large directories like `node_modules` from being sent to the Docker daemon during build — even though `COPY . .` would normally include them.

---

## Key Takeaways

- Copy dependency files separately from application code for better layer caching
- `EXPOSE` is documentation only; `-p` at runtime does the actual port mapping
- Run containers in detached mode (`-d`) for long-running services
- Use `docker logs` and `docker exec` to debug running containers
- Use a non-root `USER` in production images

---

**Next:** [03-multi-stage-build →](../03-multi-stage-build/)
