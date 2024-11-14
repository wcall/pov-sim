# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./

# Environment variables
ENV OTEL_SERVICE_NAME="flight-app-js" \
  OTEL_RESOURCE_ATTRIBUTES="deployment.environment=production,service.name=flight-app-js,service.namespace=pov-sim,service.version=1.0.0,service.instance.id=Wei-Chins-MacBook-Pro.local" \
  OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317" \
  OTEL_EXPORTER_OTLP_PROTOCOL="grpc" \
  OTEL_TRACES_EXPORTER="otlp" \
  OTEL_NODE_RESOURCE_DETECTORS="env,host,os"

# Install express
RUN npm install express swagger-jsdoc swagger-ui-express
# Install OTEL packages
RUN npm install \
  @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node \ 
  @opentelemetry/resources \ 
  @opentelemetry/semantic-conventions
# Install OTEL logs packages
RUN npm install --save \
  @opentelemetry/api-logs \
  @opentelemetry/sdk-logs
# Install GRPC exporter packages
RUN npm install --save @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc \ 
  @opentelemetry/exporter-logs-otlp-grpc

# Bundle app source
COPY . .

# Expose the port on which the app runs
EXPOSE 3000

# Command to run the app
# require opentelemetry.js to instrument the app
CMD ["node", "--require", "./opentelemetry.js", "app.js"]