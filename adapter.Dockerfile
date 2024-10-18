# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY dist/adapter.js .

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["node", "adapter.js"]