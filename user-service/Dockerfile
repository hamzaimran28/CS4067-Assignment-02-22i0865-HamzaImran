# Use minimal Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency manifests and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source
COPY . .

# Expose the port (assumed 3000)
EXPOSE 3000

# Start the service
CMD ["node", "server.js"]
