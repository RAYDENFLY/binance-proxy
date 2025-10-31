# Docker Guide - Binance Futures Proxy

## 📋 Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## 🚀 Quick Start

### Option 1: Using Docker

#### Build the image:
```bash
docker build -t binance-proxy .
```

#### Run the container:
```bash
docker run -d -p 3002:3002 --name binance-proxy binance-proxy
```

#### Check logs:
```bash
docker logs binance-proxy
```

#### Stop the container:
```bash
docker stop binance-proxy
```

#### Remove the container:
```bash
docker rm binance-proxy
```

### Option 2: Using Docker Compose (Recommended)

#### Start the service:
```bash
docker-compose up -d
```

#### View logs:
```bash
docker-compose logs -f
```

#### Stop the service:
```bash
docker-compose down
```

#### Rebuild and restart:
```bash
docker-compose up -d --build
```

## 🔧 Configuration

### Environment Variables

You can customize the following environment variables:

- `PORT`: Port number (default: 3002)
- `NODE_ENV`: Environment mode (default: production)

#### Example with custom port:
```bash
docker run -d -p 8080:8080 -e PORT=8080 --name binance-proxy binance-proxy
```

#### Using docker-compose with custom env:
Create a `.env` file:
```env
PORT=8080
NODE_ENV=production
```

Then run:
```bash
docker-compose up -d
```

## 📊 Health Check

The container includes a health check that runs every 30 seconds:

```bash
docker ps
```

Look for the "healthy" status in the STATUS column.

## 🌐 Accessing the Application

Once running, access the application at:

- **API**: http://localhost:3002
- **Swagger Documentation**: http://localhost:3002/api-docs
- **Health Check**: http://localhost:3002/api/health

## 🔍 Troubleshooting

### View container logs:
```bash
docker logs -f binance-proxy
```

### Check container status:
```bash
docker ps -a
```

### Enter container shell:
```bash
docker exec -it binance-proxy sh
```

### Remove all stopped containers:
```bash
docker container prune
```

### Remove image:
```bash
docker rmi binance-proxy
```

## 🐳 Docker Hub Deployment (Optional)

### Tag the image:
```bash
docker tag binance-proxy yourusername/binance-proxy:latest
```

### Push to Docker Hub:
```bash
docker push yourusername/binance-proxy:latest
```

### Pull and run from Docker Hub:
```bash
docker pull yourusername/binance-proxy:latest
docker run -d -p 3002:3002 yourusername/binance-proxy:latest
```

## 📦 Image Details

- **Base Image**: node:18-alpine (lightweight)
- **Exposed Port**: 3002
- **Working Directory**: /app
- **Health Check**: Enabled (every 30s)
- **Restart Policy**: unless-stopped

## 🛡️ Best Practices

1. **Use `.dockerignore`**: Already configured to exclude unnecessary files
2. **Multi-stage builds**: Current Dockerfile is optimized for production
3. **Health checks**: Enabled for container monitoring
4. **Logging**: Use `docker logs` for debugging
5. **Resource limits**: Consider adding memory/CPU limits in production

### Example with resource limits:
```bash
docker run -d -p 3002:3002 --memory="512m" --cpus="1.0" --name binance-proxy binance-proxy
```

## 🔄 Updates

To update the application:

1. Pull latest code
2. Rebuild the image:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## 📝 Notes

- The container runs as a non-root user for security
- Alpine Linux is used for a smaller image size
- Production dependencies only are installed
- Automatic restart is configured in docker-compose
