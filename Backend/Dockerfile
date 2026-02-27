FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your Express app runs on (app.listen(8080))
EXPOSE 8080

# Start the Node.js application (using app.js based on what we saw)
CMD ["node", "app.js"]
