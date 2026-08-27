# 03 — Multi-Stage Builds

> **Goal:** Dramatically reduce your final image size by separating the build environment from the runtime environment.

---

## What You'll Learn

- What multi-stage builds are and why they matter
- How to define multiple `FROM` stages in one Dockerfile
- How to `COPY --from=` to transfer only what you need
- Real image size comparison between naïve and multi-stage builds

---

## The Problem

When building applications, you typically need build tools that are **not** required at runtime. For example:

- **Go** needs the Go SDK + compiler to build, but the final binary needs nothing
- **Node.js** needs `devDependencies` to compile TypeScript, but production only needs the JS output
- **Java** needs the JDK to compile, but only needs the JRE to run

Without multi-stage builds, your production image contains all these build tools — making it large and potentially insecure.

---

## Image Size Comparison

| Approach | Base Image | Image Size |
|---|---|---|
| Naïve (full Go SDK) | `golang:1.22-alpine` | ~300 MB |
| Multi-stage (scratch) | `scratch` | ~6 MB |

That's a **50×** size reduction for the same application!

---

## The Dockerfile

```dockerfile
# Stage 1: Builder
FROM golang:1.22-alpine AS builder

WORKDIR /build
COPY go.mod ./
RUN go mod download
COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./main.go

# Stage 2: Final image
FROM scratch

COPY --from=builder /build/server /server

EXPOSE 8080
ENTRYPOINT ["/server"]
```

### Key Concepts

| Concept | Explanation |
|---|---|
| `FROM ... AS builder` | Name a stage so you can reference it later |
| `FROM scratch` | Start from an empty image (nothing pre-installed) |
| `COPY --from=builder` | Copy files from a previous stage |
| `CGO_ENABLED=0` | Build a fully static binary with no C dependencies |
| `-ldflags="-s -w"` | Strip debug symbols to reduce binary size |

---

## Build and Run

```bash
# Run from the 03-multi-stage-build directory
docker build -t multi-stage-demo .

# Run the container
docker run -d -p 8080:8080 --name multi-stage multi-stage-demo

# Open http://localhost:8080
```

---

## Inspect the Image Size

```bash
# Compare size of the base image vs our final image
docker image inspect multi-stage-demo --format='{{.Size}}' | numfmt --to=iec
docker images multi-stage-demo

# For comparison, pull the full builder image
docker pull golang:1.22-alpine
docker images golang:1.22-alpine
```

---

## How It Works Step by Step

```
┌─────────────────────────────────┐
│  Stage 1: builder               │
│  Base: golang:1.22-alpine       │
│  ├── WORKDIR /build             │
│  ├── COPY go.mod                │
│  ├── RUN go mod download        │
│  ├── COPY main.go               │
│  └── RUN go build → /build/server │
│                                 │
│  (This stage is DISCARDED)      │
└───────────────┬─────────────────┘
                │ COPY --from=builder /build/server
                ▼
┌─────────────────────────────────┐
│  Stage 2: final image           │
│  Base: scratch (empty)          │
│  └── /server  ← just the binary │
│                                 │
│  Final image: ~6 MB             │
└─────────────────────────────────┘
```

---

## Common Multi-Stage Patterns

### Node.js TypeScript App

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build   # outputs to /app/dist

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

### Java (Maven) App

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src/ ./src/
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/app.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

---

## Stop and Clean Up

```bash
docker rm -f multi-stage
docker rmi multi-stage-demo
```

---

## Key Takeaways

- Multi-stage builds separate **build** tools from **runtime** artefacts
- Use `FROM ... AS <name>` to label stages
- Use `COPY --from=<name>` to pull files across stages
- Final images can be orders of magnitude smaller
- Smaller images mean faster pulls, lower storage costs, and a smaller attack surface

---

**Next:** [04-volumes-and-persistence →](../04-volumes-and-persistence/)
