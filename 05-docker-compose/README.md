# 05 — Docker Compose

> **Goal:** Use Docker Compose to run a multi-container application (web app + PostgreSQL database + admin UI) with a single command.

---

## What You'll Learn

- What Docker Compose is and when to use it
- Writing a `docker-compose.yml` file
- Service dependencies and health checks
- Named volumes in Compose
- Custom networks in Compose
- Essential `docker compose` commands

---

## What is Docker Compose?

**Docker Compose** is a tool for defining and running **multi-container** Docker applications. Instead of running several `docker run` commands manually, you describe all your services in a single `docker-compose.yml` file and start everything with:

```bash
docker compose up
```

---

## Project Structure

```
05-docker-compose/
├── docker-compose.yml
├── db/
│   └── init.sql        # Database initialisation script
└── web/
    ├── Dockerfile
    ├── package.json
    └── app.js          # Node.js app that connects to Postgres
```

---

## The `docker-compose.yml`

```yaml
services:
  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_PORT: "5432"
      DB_NAME: appdb
      DB_USER: postgres
      DB_PASSWORD: postgres
    depends_on:
      db:
        condition: service_healthy
    networks:
      - frontend
      - backend

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: appdb
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:4
    ports:
      - "8080:8080"
    networks:
      - backend

volumes:
  db-data:

networks:
  frontend:
  backend:
```

### Key Fields Explained

| Field | Purpose |
|---|---|
| `services` | Each key under `services` is a container |
| `build` | Path to a directory with a `Dockerfile` (builds the image) |
| `image` | Use a pre-built image from Docker Hub |
| `ports` | Map `host:container` ports |
| `environment` | Set environment variables |
| `depends_on` | Start order and health check dependencies |
| `volumes` | Mount volumes or bind mounts |
| `networks` | Connect to one or more networks |
| `healthcheck` | Command to determine if a service is healthy |
| `restart` | Restart policy (`no`, `always`, `unless-stopped`, `on-failure`) |

---

## Service Discovery

In Compose, each service name acts as a **DNS hostname** within the same network. The web app connects to the database using:

```
DATABASE_URL: ******db:5432/appdb
```

The hostname `db` resolves to the IP address of the `db` container — Docker's built-in DNS handles this automatically.

---

## Start the Application

```bash
# Run from the 05-docker-compose directory
docker compose up

# Or run in the background
docker compose up -d
```

Open:
- **Web app:** http://localhost:3000
- **Adminer (DB GUI):** http://localhost:8080
  - System: PostgreSQL
  - Server: `db`
  - Username: `postgres`
  - Password: `postgres`
  - Database: `appdb`

---

## Essential Compose Commands

```bash
# Start all services (rebuild images if needed)
docker compose up --build

# Start in detached (background) mode
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes database data!)
docker compose down -v

# View logs for all services
docker compose logs

# Follow logs for a specific service
docker compose logs -f web

# List running containers managed by this Compose file
docker compose ps

# Scale a service (run multiple instances)
docker compose up -d --scale web=3

# Run a one-off command in a service container
docker compose exec web sh
docker compose exec db psql -U postgres appdb

# Rebuild images without cache
docker compose build --no-cache

# Pull latest images
docker compose pull
```

---

## Experiments

### Reload and See Persistence

```bash
# Start the stack
docker compose up -d

# Visit http://localhost:3000 — note the visit count

# Stop the stack (keeps volumes)
docker compose stop

# Restart the stack
docker compose start

# Visit http://localhost:3000 again — visit count is preserved!
```

### Delete and Recreate

```bash
# Remove containers and volumes (fresh start)
docker compose down -v

# Bring up again
docker compose up -d

# Visit count resets to 0
```

---

## Key Takeaways

- Compose manages multiple containers as a single application
- Service names act as DNS hostnames within the same network
- `depends_on` with `condition: service_healthy` waits for a service to be ready
- Named volumes persist data between `docker compose down` (but not `down -v`)
- Compose is ideal for local development and simple deployments

---

**Next:** [06-networking →](../06-networking/)
