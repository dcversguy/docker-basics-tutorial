# ============================================================
# 03 - Multi-Stage Build Example
# ============================================================
#
# Multi-stage builds allow you to use multiple FROM statements.
# Each FROM starts a new build stage with its own filesystem.
# You can selectively COPY artifacts from one stage to another,
# leaving behind build tools that you don't need at runtime.
#
# This example builds a small Go binary and packages it into
# a minimal "distroless" image — no shell, no OS packages,
# just the binary. This is a common pattern for production images.
# ============================================================

# ── Stage 1: Builder ─────────────────────────────────────────
# Use the full Go SDK image to compile the application.
# This image is large (~800 MB) but we only use it to build.
FROM golang:1.22-alpine AS builder

WORKDIR /build

# Copy dependency manifest files first (for caching)
COPY go.mod ./

# Download modules (cached unless go.mod changes)
RUN go mod download

# Copy the source code
COPY main.go ./

# Build a statically linked binary
# CGO_ENABLED=0 ensures a fully static binary (no C lib deps)
# -ldflags="-s -w" strips debug symbols to reduce binary size
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./main.go


# ── Stage 2: Final image ──────────────────────────────────────
# Start fresh from a minimal base image.
# "scratch" is an empty image — literally nothing.
# We COPY just the compiled binary from the builder stage.
FROM scratch

# Copy the binary from the builder stage
COPY --from=builder /build/server /server

# The container listens on port 8080
EXPOSE 8080

# Run the binary
ENTRYPOINT ["/server"]
