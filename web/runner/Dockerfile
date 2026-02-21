FROM golang:1.22-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN CGO_ENABLED=0 go build -o runner .

FROM golang:1.22-alpine
RUN apk add --no-cache git nodejs npm bash curl docker-cli jq

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl && mv kubectl /usr/local/bin/

# Install k3d
RUN curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

COPY --from=builder /build/runner /usr/local/bin/runner
ENTRYPOINT ["runner"]
CMD ["--courses-root", "/courses", "--port", "8081"]
EXPOSE 8081
