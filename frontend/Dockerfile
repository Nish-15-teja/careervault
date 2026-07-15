# Use lightweight Node Alpine runtime
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency files first
COPY package*.json ./

# Install frontend library dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Expose Vite development server port
EXPOSE 5173

# Start Vite, passing the host flag to expose it to the container network
CMD ["npm", "run", "dev", "--", "--host"]
