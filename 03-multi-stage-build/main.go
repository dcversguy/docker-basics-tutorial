package main

import (
	"fmt"
	"net/http"
	"os"
	"runtime"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		hostname, _ := os.Hostname()
		fmt.Fprintf(w, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Multi-Stage Build Demo</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; }
    h1 { color: #0db7ed; }
    .info { background: #f0f0f0; padding: 16px; border-radius: 8px; }
    code { background: #ddd; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🐳 Multi-Stage Build Demo</h1>
  <p>This Go binary was built in a multi-stage Docker build.</p>
  <div class="info">
    <h2>Server Info</h2>
    <p><strong>Hostname:</strong> <code>%s</code></p>
    <p><strong>Go version:</strong> <code>%s</code></p>
    <p><strong>OS/Arch:</strong> <code>%s/%s</code></p>
    <p><strong>Port:</strong> <code>%s</code></p>
  </div>
</body>
</html>`, hostname, runtime.Version(), runtime.GOOS, runtime.GOARCH, port)
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok"}`)
	})

	fmt.Printf("Server listening on port %s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
