const { trace, metrics } = require('@opentelemetry/api');
const tracer = trace.getTracer(
  'flight-app-js',
  '1.0.0',
);
const meter = metrics.getMeter('flight-app-js','1.0.0');
const counter = meter.createCounter('flight-app-js.root_endpoint.counter', {
  description: 'Counts the number of times the root endpoint is invoked',
});
const logsAPI = require('@opentelemetry/api-logs');
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} = require('@opentelemetry/sdk-logs');
// To start a logger, you first need to initialize the Logger provider.
const loggerProvider = new LoggerProvider();
// Add a processor to export log record
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);
//  To create a log record, you first need to get a Logger instance
const logger = loggerProvider.getLogger('default');

const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const utils = require('./utils.js');

const AIRLINES = ['AA', 'UA', 'DL'];

const app = express();

const swaggerDocs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flight App',
      version: '1.0.0',
      description: 'A simple Express Flight App',
    },
  },
  apis: ['app.js'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: No-op home endpoint
 *     responses:
 *       200:
 *         description: Returns ok
 */
app.get('/', (req, res) => {
  counter.add(1);
  res.send({'message': 'ok'});
  // emit a log record
  logger.emit({
    severityNumber: logsAPI.SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'custom log record for the root endpoint',
    attributes: { 'log.type': 'LogRecord' },
  });
});

/**
 * @swagger
 * /airlines/{err}:
 *   get:
 *     summary: Get airlines endpoint. Set err to "raise" to trigger an exception.
 *     parameters:
 *       - in: path
 *         name: err
 *         type: string
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - raise
 *     responses:
 *       200:
 *         description: Returns a list of airlines
 */
app.get('/airlines/:err?', (req, res) => {
  // Create a span.
  return tracer.startActiveSpan('get_airlines', span => {
    if (req.params.err === 'raise') {
      throw new Error('Raise test exception');
    }

    res.send({ airlines: AIRLINES });
    span.end();
  });
  // emit a log record
  logger.emit({
    severityNumber: logsAPI.SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'custom log record for the get airlines endpoint',
    attributes: { 'log.type': 'LogRecord' },
  });
});

/**
 * @swagger
 * /flights/{airline}/{err}:
 *   get:
 *     summary: Get flights endpoint. Set err to "raise" to trigger an exception.
 *     parameters:
 *       - in: path
 *         name: airline
 *         type: string
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - AA
 *             - UA
 *             - DL
 *       - in: path
 *         name: err
 *         type: string
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - raise
 *     responses:
 *       200:
 *         description: Returns a list of airlines
 */
app.get('/flights/:airline/:err?', (req, res) => {
  if (req.params.err === 'raise') {
    throw new Error('Raise test exception');
  }
  // Record a new histogram value based on the random int generated
  const histogram = meter.createHistogram('flights.randomInt');
  const randomInt = utils.getRandomInt(100, 999);
  res.send({[req.params.airline]: [randomInt]});
  histogram.record(randomInt);
  // emit a log record
  logger.emit({
    severityNumber: logsAPI.SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'custom log record for the get flights endpoint',
    attributes: { 'log.type': 'LogRecord' },
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
