FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/pomkita-server ./cmd/server

FROM alpine:3.22

WORKDIR /app
RUN addgroup -S pomkita && adduser -S -G pomkita pomkita
RUN apk add --no-cache tzdata
COPY --from=build /out/pomkita-server /app/pomkita-server
COPY --from=build /src/migrations /app/migrations
USER pomkita
EXPOSE 8080
ENTRYPOINT ["/app/pomkita-server"]
