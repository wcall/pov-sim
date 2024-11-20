/* opentelemetry.js */
// Require dependencies
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { opentelemetry} = require('@opentelemetry/api');
// add OTLP exporters
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
//} = require('@opentelemetry/exporter-trace-otlp-grpc');
} = require('@opentelemetry/exporter-trace-otlp-proto');


const {
  OTLPMetricExporter,
//} = require('@opentelemetry/exporter-metrics-otlp-grpc');
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const {
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

const collectorOptions = {
  timeoutMillis: 15000,
  //url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/traces
  headers: {
    //foo: 'bar'
  }, //an optional object containing custom headers to be sent with each request will only work with http
};

const exporter = new OTLPTraceExporter(collectorOptions);
const provider = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(exporter)]
});
//provider.register();

//metrics
const metricExporter = new OTLPMetricExporter(collectorOptions);
//meterProvider.addMetricReader(new PeriodicExportingMetricReader({
//  exporter: metricExporter,
//  exportIntervalMillis: 15000,
//}));


// Set up the SDK for auto-instrumentation
const sdk = new NodeSDK({
  resource: resource,
  //traceExporter: new ConsoleSpanExporter(),
  traceExporter: exporter, 
  //metricReader: metricExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
  }),
  //logRecordProcessor: new BatchLogRecordProcessor(loggerExporter), // referencing https://github.com/open-telemetry/opentelemetry-js/issues/4552
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
