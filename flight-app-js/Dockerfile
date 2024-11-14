# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
# Install express
RUN npm install express swagger-jsdoc swagger-ui-express
# Install OTEL dependencies
RUN npm install \
  @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
RUN npm install --save \
  @opentelemetry/api-logs \
  @opentelemetry/sdk-logs

# Bundle app source
COPY . .

# Expose the port on which the app runs
EXPOSE 3000

# Command to run the app
# require opentelemetry.js to instrument the app
CMD ["node", "--require", "./opentelemetry.js", "app.js"]