# ============================================================
# 01 - Hello World Dockerfile
# ============================================================
#
# Every Dockerfile starts with a FROM instruction that sets
# the base image. Here we use the official Alpine Linux image
# — an extremely small (≈5 MB) Linux distribution.
#
FROM alpine:3.19

# CMD defines the default command to run when a container
# starts. Here we simply echo a greeting and then list the
# directory contents to show the container's filesystem.
CMD ["sh", "-c", "echo '👋 Hello from Docker!' && echo '' && echo 'Container info:' && uname -a"]
