//tracing
const { trace, metrics } = require('@opentelemetry/api');
const tracer = trace.getTracer(
  'flight-app-js',
  '1.0.0',
);
const {
  SEMATTRS_CODE_FUNCTION,
  SEMATTRS_CODE_FILEPATH,
} = require('@opentelemetry/semantic-conventions');

//metrics
const meter = metrics.getMeter('flight-app-js','1.0.0');
const counter = meter.createCounter('flight-app-js.root_endpoint.counter', {
  description: 'Counts the number of times the root endpoint is invoked',
});

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
      span.addEvent('exception in get_airlines',{
        'log.severity': 'error',
        'log.message': 'raise exception in get_airlines'
      });
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Error: Raise test exception in get_airlines',
      })
      logger.emit({
        severityNumber: logsAPI.SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: 'custom log record for the exception raised in get_airlines',
        attributes: { 'log.type': 'LogRecord' },
      });
      throw new Error('Raise test exception');
    }

    // Add an attribute to the span
    const random_int = utils.getRandomInt(100, 999);
    span.setAttribute('get_airlines.random_int', random_int.toString());
    span.setAttribute(SEMATTRS_CODE_FUNCTION, 'get_airlines');
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
    // emit a log record
    logger.emit({
      severityNumber: logsAPI.SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: 'custom log record for an exception raised in get_flights endpoint',
      attributes: { 'log.type': 'LogRecord' },
    });
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
