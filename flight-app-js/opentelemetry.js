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

//logging
const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const { logs, SeverityNumber } = require('@opentelemetry/api-logs');
const {
  LoggerProvider,
  BatchLogRecordProcessor,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} = require('@opentelemetry/sdk-logs');
// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
//const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-proto');
const loggerExporter = new OTLPLogExporter(collectorOptions);
// To start a logger, you first need to initialize the Logger provider.
const loggerProvider = new LoggerProvider({
  resource: resource,
});
// Add a processor to export log record
//loggerProvider.addLogRecordProcessor(
  //new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
//  new BatchLogRecordProcessor(loggerExporter)
//);
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => loggerProvider.shutdown().catch(console.error));
});
//logs.setGlobalLoggerProvider(loggerProvider);

// Set up the SDK for auto-instrumentation
const sdk = new NodeSDK({
  resource: resource,
  //traceExporter: new ConsoleSpanExporter(),
  traceExporter: exporter, 
  //metricReader: metricExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
  }),
  logRecordProcessor: new BatchLogRecordProcessor(loggerExporter), // referencing https://github.com/open-telemetry/opentelemetry-js/issues/4552
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
