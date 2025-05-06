FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .
RUN npm rebuild esbuild
# Create directories for uploads
RUN mkdir -p /var/uploads/mara-claims
RUN mkdir -p public/uploads
RUN mkdir -p attached_assets

# Make our entrypoint script executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Build the application
RUN npm run build

# Expose the port
EXPOSE 10000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=10000
ENV UPLOAD_DIR=/var/uploads

# Start the application with our custom entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]