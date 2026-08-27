# Docker Basics Tutorial

A hands-on tutorial for learning Docker fundamentals, from your first container to multi-container applications.

---

## Table of Contents

1. [What is Docker?](#what-is-docker)
2. [Key Concepts](#key-concepts)
3. [Installation](#installation)
4. [Basic Workflow](#basic-workflow)
5. [Tutorial Sections](#tutorial-sections)

---

## What is Docker?

**Docker** is an open-source platform that lets you package, distribute, and run applications inside lightweight, isolated environments called **containers**. Think of a container as a self-contained box that includes your application code, its runtime, libraries, and all dependencies — so it runs the same way everywhere, regardless of the host operating system.

### Why Use Docker?

| Problem Without Docker | Solution With Docker |
|---|---|
| "It works on my machine" | Consistent environment everywhere |
| Dependency conflicts between projects | Isolated containers per project |
| Slow, heavy virtual machines | Lightweight containers that start in seconds |
| Difficult onboarding for new developers | `docker compose up` and you're running |
| Inconsistent deployments | Same image from dev to production |

---

## Key Concepts

### Images

An **image** is a read-only template used to create containers. Think of it like a recipe or a blueprint. Images are built from a `Dockerfile` and can be stored in a registry like [Docker Hub](https://hub.docker.com/).

```
Dockerfile  →  docker build  →  Image
```

### Containers

A **container** is a running instance of an image. You can run many containers from a single image. Containers are isolated from each other and from the host, but they share the host OS kernel — making them much more lightweight than virtual machines.

```
Image  →  docker run  →  Container (running process)
```

### Volumes

**Volumes** are Docker-managed directories used to persist data beyond the lifetime of a container. Without a volume, data written inside a container is lost when the container stops.

```
Container  ←→  Volume  (data persists after container stops)
```

### Networks

Docker **networks** allow containers to communicate with each other. By default, Docker creates a bridge network. You can create custom networks to control which containers can talk to which.

```
Container A  ←→  Network  ←→  Container B
```

### Registry

A **registry** is a storage and distribution service for Docker images. [Docker Hub](https://hub.docker.com/) is the default public registry. You can also run private registries.

---

## Installation

### macOS and Windows

Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/). It includes:
- Docker Engine
- Docker CLI
- Docker Compose
- Docker Scout

### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running Docker without sudo (optional, requires logout/login)
sudo usermod -aG docker $USER
```

### Verify Installation

```bash
docker --version
docker compose version
docker run hello-world
```

---

## Basic Workflow

The typical Docker workflow looks like this:

```
1. Write a Dockerfile
       ↓
2. Build an image
   docker build -t my-app:latest .
       ↓
3. Run a container
   docker run -p 8080:80 my-app:latest
       ↓
4. (Optional) Push to a registry
   docker push my-username/my-app:latest
```

### Essential Commands at a Glance

```bash
# Images
docker build -t name:tag .       # Build an image from a Dockerfile
docker images                    # List local images
docker pull nginx                # Download an image from Docker Hub
docker rmi my-app:latest         # Remove an image

# Containers
docker run nginx                 # Create and start a container
docker run -d -p 8080:80 nginx   # Run detached, with port mapping
docker ps                        # List running containers
docker ps -a                     # List all containers (including stopped)
docker stop <id>                 # Stop a running container
docker rm <id>                   # Remove a stopped container
docker logs <id>                 # View container logs
docker exec -it <id> bash        # Open a shell inside a running container

# Cleanup
docker system prune              # Remove unused data
```

---

## Tutorial Sections

Work through these sections in order for the best learning experience:

| Section | Topic | Description |
|---|---|---|
| [01-hello-world](./01-hello-world/) | First container | Build and run your very first Docker image |
| [02-simple-app](./02-simple-app/) | Web application | Containerise a Node.js web app with port mapping |
| [03-multi-stage-build](./03-multi-stage-build/) | Build optimisation | Reduce image size with multi-stage builds |
| [04-volumes-and-persistence](./04-volumes-and-persistence/) | Data persistence | Keep data alive across container restarts |
| [05-docker-compose](./05-docker-compose/) | Multi-container apps | Orchestrate a web app + database with Compose |
| [06-networking](./06-networking/) | Container networking | Let containers discover and talk to each other |

For a handy command reference, see **[QUICK-START.md](./QUICK-START.md)**.

---

## Prerequisites

- A computer running macOS, Windows, or Linux
- Docker Desktop (macOS/Windows) or Docker Engine (Linux) installed
- Basic familiarity with the command line
- No prior Docker knowledge required!
