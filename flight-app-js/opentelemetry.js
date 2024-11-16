/* opentelemetry.js */
// Require dependencies
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { opentelemetry } = require('@opentelemetry/api');
// add OTLP exporters
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-grpc');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: 'flight-app-js',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  })
);

const metricExporter = new PeriodicExportingMetricReader({
  //exporter: new ConsoleMetricExporter(),
  exporter: new OTLPMetricExporter({
    //url: 'http://localhost:4317/v1/metrics',
    url: 'http://localhost:4317',
  }),
  exportIntervalMillis: 15000, // Set to 15 seconds for demonstrative purposes only.
});

/*
const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
*/

// Set up the SDK for auto-instrumentation
const sdk = new NodeSDK({
  resource: resource,
  //traceExporter: new ConsoleSpanExporter(),
  traceExporter: new OTLPTraceExporter({
    //url: 'http://localhost:4317/v1/traces',
    url: 'http://localhost:4317',
  }),
  metricReader: metricExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
