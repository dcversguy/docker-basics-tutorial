# Docker Quick-Start Cheat Sheet

> Fast reference for the most commonly used Docker commands.

---

## Images

```bash
# Build an image from a Dockerfile in the current directory
docker build -t name:tag .

# Build with no cache (forces every layer to rebuild)
docker build --no-cache -t name:tag .

# List all local images
docker images

# Pull an image from Docker Hub
docker pull nginx:latest

# Push an image to Docker Hub (must be logged in)
docker push username/name:tag

# Tag an existing image with a new name
docker tag old-name:tag username/new-name:tag

# Remove an image
docker rmi name:tag

# Remove all unused (dangling) images
docker image prune

# Remove all images not used by a container
docker image prune -a

# Show detailed info about an image
docker image inspect name:tag
```

---

## Containers

```bash
# Create and start a container (foreground)
docker run nginx

# Run in detached (background) mode
docker run -d nginx

# Name the container
docker run -d --name my-nginx nginx

# Map host port 8080 → container port 80
docker run -d -p 8080:80 nginx

# Set an environment variable
docker run -d -e MY_VAR=hello nginx

# Mount a volume: named
docker run -d -v my-vol:/data nginx

# Mount a volume: bind mount
docker run -d -v /host/path:/container/path nginx

# Mount a volume: read-only
docker run -d -v /host/path:/container/path:ro nginx

# Auto-remove the container when it exits
docker run --rm alpine echo hello

# Override the default command
docker run alpine sh -c "echo hello"

# Open interactive terminal
docker run -it ubuntu bash

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a running container gracefully
docker stop my-nginx

# Kill a container immediately
docker kill my-nginx

# Start a stopped container
docker start my-nginx

# Restart a container
docker restart my-nginx

# Remove a stopped container
docker rm my-nginx

# Force remove a running container
docker rm -f my-nginx

# View container logs
docker logs my-nginx

# Follow (tail) container logs
docker logs -f my-nginx

# Show last 50 lines of logs
docker logs --tail 50 my-nginx

# Open a shell inside a running container
docker exec -it my-nginx bash
docker exec -it my-nginx sh   # when bash is not available

# Run a one-off command inside a running container
docker exec my-nginx nginx -t

# Copy files to/from a container
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./nginx.conf my-nginx:/etc/nginx/nginx.conf

# Show resource usage (CPU, memory, network)
docker stats

# Show processes inside a container
docker top my-nginx

# Show detailed container info
docker inspect my-nginx
```

---

## Volumes

```bash
# Create a named volume
docker volume create my-vol

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect my-vol

# Remove a volume
docker volume rm my-vol

# Remove all unused volumes
docker volume prune
```

---

## Networks

```bash
# List networks
docker network ls

# Create a custom bridge network
docker network create my-net

# Connect a running container to a network
docker network connect my-net my-container

# Disconnect a container from a network
docker network disconnect my-net my-container

# Remove a network
docker network rm my-net

# Remove all unused networks
docker network prune

# Inspect a network (shows connected containers and their IPs)
docker network inspect my-net
```

---

## Docker Compose

```bash
# Start all services (build images if needed)
docker compose up

# Start in detached mode
docker compose up -d

# Rebuild images before starting
docker compose up --build

# Stop all services (keeps containers and volumes)
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Stop, remove containers AND volumes
docker compose down -v

# List running services
docker compose ps

# View logs for all services
docker compose logs

# Follow logs for a specific service
docker compose logs -f web

# Open a shell in a running service
docker compose exec web sh

# Run a one-off command in a new container
docker compose run web node --version

# Scale a service to N replicas
docker compose up -d --scale web=3

# Pull latest images for services
docker compose pull

# Validate the compose file
docker compose config
```

---

## System Cleanup

```bash
# Remove all stopped containers, unused networks, dangling images, and build cache
docker system prune

# Also remove unused images (not just dangling)
docker system prune -a

# Remove everything including volumes (DANGEROUS — deletes data!)
docker system prune -a --volumes

# Show disk usage
docker system df
```

---

## Registry

```bash
# Log in to Docker Hub
docker login

# Log in to a private registry
docker login registry.example.com

# Log out
docker logout

# Search Docker Hub for images
docker search nginx
```

---

## Dockerfile Quick Reference

```dockerfile
FROM base-image:tag          # Set the base image
WORKDIR /app                 # Set working directory
COPY src dest                # Copy files from host to image
ADD src dest                 # Like COPY but supports URLs and auto-unpacks archives
RUN command                  # Run a command during build
ENV KEY=value                # Set an environment variable
ARG NAME=default             # Build-time variable (not in final image)
EXPOSE 3000                  # Document a port (does not publish)
VOLUME ["/data"]             # Declare a volume mount point
USER username                # Switch to a non-root user
ENTRYPOINT ["executable"]    # Fixed command (cannot be overridden by `docker run args`)
CMD ["arg1", "arg2"]         # Default arguments (overridden by `docker run`)
LABEL key=value              # Add metadata
HEALTHCHECK CMD ...          # Define a health check command
```

---

## Troubleshooting

### Container won't start

```bash
# Check exit code and last logs
docker ps -a
docker logs <container-id>

# Start with an overridden CMD to investigate
docker run -it --entrypoint sh my-image
```

### Can't connect to a port

```bash
# Verify the port is published
docker ps  # Check PORTS column

# Verify the app is listening inside the container
docker exec -it my-app sh
netstat -tlnp   # or: ss -tlnp
```

### Container runs out of disk space

```bash
docker system df
docker system prune -a
```

### Container can't reach another service

```bash
# Check they're on the same network
docker network inspect my-net

# Test DNS resolution from inside the container
docker exec -it my-app sh
nslookup other-service
wget -qO- http://other-service:port
```

### Image build is slow

```bash
# Use .dockerignore to exclude large directories
echo "node_modules" >> .dockerignore

# Order Dockerfile instructions so rarely-changing layers come first
# (dependencies before application code)
```

### "Permission denied" errors

```bash
# Check what user the container runs as
docker exec -it my-app whoami
docker inspect my-app --format='{{.Config.User}}'

# Fix volume ownership (run as root temporarily)
docker run --user root -it my-app chown -R node:node /data
```

---

## Useful One-Liners

```bash
# Remove all stopped containers
docker container prune

# Remove all containers (running and stopped)
docker rm -f $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -q)

# Follow logs for a container matching a name pattern
docker logs -f $(docker ps -q --filter name=web)

# Get the IP address of a container
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-container

# Export a container's filesystem as a tar archive
docker export my-container > backup.tar

# Save an image to a tar file (for offline transfer)
docker save my-image:latest | gzip > my-image.tar.gz

# Load an image from a tar file
docker load < my-image.tar.gz
```
