FROM golang:1.22-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN CGO_ENABLED=0 go build -o runner .

FROM golang:1.22-alpine
RUN apk add --no-cache git nodejs npm
COPY --from=builder /build/runner /usr/local/bin/runner
ENTRYPOINT ["runner"]
CMD ["--courses-root", "/courses", "--port", "8081"]
EXPOSE 8081
