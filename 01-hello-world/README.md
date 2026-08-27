# 01 — Hello World

> **Goal:** Build and run your very first Docker image.

---

## What You'll Learn

- How to write a `Dockerfile`
- How to build an image with `docker build`
- How to run a container with `docker run`
- The difference between an **image** and a **container**

---

## The Dockerfile

```dockerfile
FROM alpine:3.19

CMD ["sh", "-c", "echo '👋 Hello from Docker!' && echo '' && echo 'Container info:' && uname -a"]
```

### Line-by-Line Breakdown

| Instruction | Meaning |
|---|---|
| `FROM alpine:3.19` | Start from the official Alpine Linux 3.19 image |
| `CMD [...]` | Default command to run when the container starts |

---

## Build the Image

```bash
# Run from the 01-hello-world directory
docker build -t hello-docker .
```

**What happens:**
1. Docker reads the `Dockerfile`
2. Downloads the `alpine:3.19` base image from Docker Hub (first time only)
3. Creates a new image layer with your `CMD`
4. Tags the resulting image as `hello-docker`

You should see output like:
```
[+] Building 1.2s (5/5) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 120B
 => [internal] load .dockerignore
 => [1/1] FROM docker.io/library/alpine:3.19
 => exporting to image
 => => naming to docker.io/library/hello-docker
```

---

## Run the Container

```bash
docker run hello-docker
```

Expected output:
```
👋 Hello from Docker!

Container info:
Linux abc123def456 6.x.x #1 SMP ... x86_64 Linux
```

---

## Inspect What You've Created

```bash
# List images on your machine
docker images

# You should see something like:
# REPOSITORY     TAG       IMAGE ID       CREATED         SIZE
# hello-docker   latest    abc123def456   2 minutes ago   7.38MB
```

---

## Experiments

### Try changing the message

Edit `Dockerfile` and change the `echo` text, then rebuild:

```bash
docker build -t hello-docker:v2 .
docker run hello-docker:v2
```

### Run interactively

Instead of the default `CMD`, override it at runtime:

```bash
# Open an interactive shell inside the container
docker run -it hello-docker sh

# Now you're inside the container! Try:
ls /
cat /etc/os-release
exit
```

### See the container lifecycle

```bash
# Run in detached mode (but it exits immediately since CMD completes)
docker run --name my-hello hello-docker

# List all containers, including stopped ones
docker ps -a

# Remove the stopped container
docker rm my-hello
```

---

## Key Takeaways

- A **Dockerfile** is the recipe for building a Docker **image**
- `FROM` sets the starting point (base image)
- `CMD` sets the default command
- `docker build` creates an image from the Dockerfile
- `docker run` creates and starts a container from an image
- The container **stops** as soon as its main process exits

---

**Next:** [02-simple-app →](../02-simple-app/)
