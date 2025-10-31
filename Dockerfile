# Use official Node.js LTS (Long Term Support) image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose the port the app runs on
# Note: Easypanel might override this with PORT env variable
EXPOSE 3000

# Set environment variables
# Use PORT from environment or default to 3000 (Easypanel standard)
ENV NODE_ENV=production

# Health check - use PORT env variable dynamically
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').get('http://localhost:' + port + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Run the application
CMD ["node", "index.js"]
