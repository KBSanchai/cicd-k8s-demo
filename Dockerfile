# Use Node.js 18 Alpine (lightweight)
FROM node:18-alpine
# Set working directory inside container
WORKDIR /app
# Copy package files first (for better caching)
COPY package*.json ./
# Install dependencies
RUN npm install --production
# Copy application source code
COPY . .
# Expose the application port
EXPOSE 3000
# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
USER nodeuser
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
# Start the application
CMD ["node", "app.js"]