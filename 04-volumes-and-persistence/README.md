# 04 — Volumes and Data Persistence

> **Goal:** Understand how Docker volumes keep your data alive across container restarts and removals.

---

## What You'll Learn

- Why container data is ephemeral by default
- Named volumes vs bind mounts
- The `VOLUME` instruction in Dockerfiles
- How to create, inspect, and remove volumes
- Real-world persistence patterns

---

## The Problem: Ephemeral Containers

By default, data written inside a container is stored in the container's **writable layer**. When the container is removed, the data is gone forever.

```bash
# Demonstrate the problem
docker run --rm -it alpine sh -c "echo 'hello' > /tmp/data.txt && cat /tmp/data.txt"
# Output: hello

# Now run again — the file is gone
docker run --rm -it alpine sh -c "cat /tmp/data.txt 2>&1 || echo 'File not found!'"
# Output: File not found!
```

---

## The Solution: Volumes

Docker **volumes** are stored on the host filesystem, managed by Docker, and mounted into containers. Data in a volume outlives the container.

```
Container A ──→ Volume ──→ Container B
                  ↓
            Host filesystem
          /var/lib/docker/volumes/
```

---

## Build the Example App

```bash
# Run from the 04-volumes-and-persistence directory
docker build -t notes-app .
```

---

## Experiment 1 — Without a Volume (data is lost)

```bash
# Run the app without a volume
docker run -d -p 3000:3000 --name notes-no-vol notes-app

# Open http://localhost:3000 and add some notes

# Stop and remove the container
docker rm -f notes-no-vol

# Run again — notes are gone!
docker run -d -p 3000:3000 --name notes-no-vol notes-app
```

---

## Experiment 2 — Named Volume (data persists)

### Create and Use a Named Volume

```bash
# Create a named volume
docker volume create notes-data

# Run the app with the volume mounted to /data
docker run -d -p 3000:3000 \
  --name notes-with-vol \
  -v notes-data:/data \
  notes-app

# Open http://localhost:3000 and add some notes

# Stop and remove the container
docker rm -f notes-with-vol

# Run a new container with the SAME volume — notes are still there!
docker run -d -p 3000:3000 \
  --name notes-restored \
  -v notes-data:/data \
  notes-app
```

The `-v notes-data:/data` flag mounts the `notes-data` volume to the `/data` path inside the container.

---

## Experiment 3 — Bind Mount (local directory)

A **bind mount** maps a directory from your host machine directly into the container:

```bash
# Create a local directory for the data
mkdir -p /tmp/my-notes

# Mount it into the container
docker run -d -p 3000:3000 \
  --name notes-bind \
  -v /tmp/my-notes:/data \
  notes-app

# Notes are now stored in /tmp/my-notes on your host
ls /tmp/my-notes
cat /tmp/my-notes/notes.json
```

### Named Volume vs Bind Mount

| Feature | Named Volume | Bind Mount |
|---|---|---|
| Managed by Docker | ✅ Yes | ❌ No |
| Portable across hosts | ✅ Yes | ❌ No (path must exist) |
| Use in production | ✅ Recommended | ⚠️ Use with care |
| Good for development | ❌ Harder to inspect | ✅ Easy to edit |
| Performance on macOS/Windows | ✅ Fast (Docker VM) | ⚠️ Slower on non-Linux |

---

## Volume Management Commands

```bash
# List all volumes
docker volume ls

# Inspect a volume (shows its mount point on the host)
docker volume inspect notes-data

# Remove a volume (fails if in use by a container)
docker volume rm notes-data

# Remove all unused volumes
docker volume prune
```

---

## Read-Only Bind Mounts

You can mount volumes as read-only using `:ro`:

```bash
# Mount config as read-only
docker run -d \
  -v /path/to/config:/app/config:ro \
  notes-app
```

---

## The `VOLUME` Instruction

The `VOLUME ["/data"]` instruction in the Dockerfile:

1. Declares `/data` as a volume mount point
2. Creates an **anonymous volume** automatically if the user doesn't specify `-v`
3. Any data written to `/data` during build (`RUN` steps) **after** the `VOLUME` instruction is discarded — write data before `VOLUME` or use volumes at runtime

---

## Clean Up

```bash
docker rm -f notes-with-vol notes-restored notes-bind notes-no-vol
docker volume rm notes-data
docker rmi notes-app
```

---

## Key Takeaways

- Container data is **ephemeral** unless you use volumes
- **Named volumes** are managed by Docker and are portable
- **Bind mounts** map host directories directly (great for development)
- Use `-v volume-name:/path` for named volumes
- Use `-v /host/path:/container/path` for bind mounts
- `docker volume ls/inspect/rm/prune` manages volumes

---

**Next:** [05-docker-compose →](../05-docker-compose/)
