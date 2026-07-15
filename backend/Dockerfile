# Use lightweight Node runtime on Alpine Linux
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package metadata first to optimize Docker layer cache
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of the backend source code
COPY . .

# Expose the API server port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
