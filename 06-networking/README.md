# 06 — Container Networking

> **Goal:** Understand how Docker containers find and communicate with each other using networks, service discovery, and DNS.

---

## What You'll Learn

- How Docker networking works under the hood
- The default bridge network vs custom networks
- How containers discover each other by service name (DNS)
- How to isolate services using separate networks
- Port exposure vs publishing

---

## Docker Network Types

| Driver | Description |
|---|---|
| `bridge` | Default. Private internal network on a single host |
| `host` | Container shares the host's network namespace (Linux only) |
| `none` | No networking — completely isolated |
| `overlay` | Multi-host networking (used with Docker Swarm) |
| `macvlan` | Assign a MAC address to a container (advanced use) |

For most applications, **bridge networks** are what you'll use.

---

## Default Bridge Network vs Custom Bridge

### Default Bridge (`docker0`)

When you run `docker run nginx` without specifying a network, Docker puts the container on the **default bridge** network. Containers on the default bridge can only communicate by IP address — not by name.

```bash
# These two containers CANNOT use hostnames to reach each other
docker run -d --name app1 nginx
docker run -d --name app2 nginx
docker exec app2 ping app1   # This FAILS on the default bridge
```

### Custom Bridge Network

When you create a custom bridge network, Docker provides **automatic DNS resolution** by container/service name:

```bash
# Create a custom network
docker network create my-network

# Run containers on the custom network
docker run -d --name app1 --network my-network nginx
docker run -d --name app2 --network my-network nginx

# app2 can now reach app1 by NAME
docker exec app2 ping app1   # This WORKS!
```

---

## Project Structure

```
06-networking/
├── docker-compose.yml   # Two connected apps + one isolated
├── Dockerfile
├── package.json
└── app.js               # Simple HTTP server that pings a target
```

---

## The `docker-compose.yml`

```yaml
services:
  sender:
    build: .
    ports:
      - "3001:3001"
    environment:
      APP_NAME: sender
      TARGET_HOST: receiver   # Docker DNS resolves this!
      TARGET_PORT: "4000"
    networks:
      - app-network

  receiver:
    build: .
    ports:
      - "4000:4000"
    environment:
      APP_NAME: receiver
      LISTEN_PORT: "4000"
    networks:
      - app-network

  isolated:
    image: alpine:3.19
    command: sh -c "echo 'I am isolated' && sleep infinity"
    networks:
      - isolated-network   # DIFFERENT network

networks:
  app-network:
    driver: bridge
  isolated-network:
    driver: bridge
```

---

## Start the Demo

```bash
# Run from the 06-networking directory
docker compose up -d
```

Open:
- **Sender:** http://localhost:3001 — shows whether it can reach the receiver
- **Receiver:** http://localhost:4000 — shows its own info

---

## DNS Resolution in Action

```bash
# Open a shell in the sender container
docker compose exec sender sh

# Ping the receiver by name (DNS works within the same network)
ping receiver

# Curl the receiver's /ping endpoint
wget -qO- http://receiver:4000/ping

# Try to reach the isolated service — this FAILS
wget -qO- http://isolated:3000/ping    # Network unreachable

exit
```

---

## Inspecting Networks

```bash
# List all networks
docker network ls

# Inspect the app-network
docker network inspect 06-networking_app-network

# You'll see both sender and receiver listed under Containers,
# with their IPs on the network

# Show which networks a container is connected to
docker inspect 06-networking-sender-1 --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool
```

---

## Manual Networking (Without Compose)

```bash
# Create a custom bridge network
docker network create demo-net

# Run two containers on it
docker run -d --name web --network demo-net nginx
docker run -d --name client --network demo-net alpine sleep 300

# client can reach web by name
docker exec client wget -qO- http://web

# Clean up
docker rm -f web client
docker network rm demo-net
```

---

## Connecting a Container to Multiple Networks

A container can be connected to multiple networks. This is useful for a web app that:
- Needs to talk to the database (backend network)
- Needs to be reachable from the host (frontend network)

```yaml
services:
  web:
    networks:
      - frontend   # Reachable from host via published port
      - backend    # Can reach the database

  db:
    networks:
      - backend    # Only reachable from the backend network
```

The `db` service is **not exposed** to the frontend network — providing network-level isolation.

---

## Port Publishing vs Exposing

```bash
# EXPOSE in Dockerfile: documents the port, does nothing at runtime
EXPOSE 3000

# -p publishes the port to the host (accessible from outside Docker)
docker run -p 3000:3000 my-app

# --expose exposes the port only to other containers on the same network
docker run --expose 3000 my-app
```

---

## Clean Up

```bash
docker compose down

# Remove any manually created networks
docker network prune
```

---

## Key Takeaways

- Custom bridge networks provide automatic DNS between containers
- The default bridge network does NOT support DNS by name
- Use separate networks to isolate services from each other
- Containers can belong to multiple networks
- `EXPOSE` is documentation; `-p` or `ports:` actually publishes to the host
- In Compose, service names are DNS hostnames within shared networks

---

**You've completed all the core sections!** 🎉

Check out the **[QUICK-START.md](../QUICK-START.md)** for a handy command reference.
