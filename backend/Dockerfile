# Use a lightweight Node.js image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first for better build caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Backend API port
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
