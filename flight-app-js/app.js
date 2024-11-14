const opentelemetry = require('@opentelemetry/api');
const tracer = opentelemetry.trace.getTracer(
  'flight-app-js',
  '1.0.0',
);
const {
  MeterProvider
} = require('@opentelemetry/sdk-metrics');
const meter = new MeterProvider().getMeter('flight-app-js');
const counter = meter.createCounter('root_endpoint_counter', {
  description: 'Counts the number of times the root endpoint is invoked',
});
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
  const randomInt = utils.getRandomInt(100, 999);
  res.send({[req.params.airline]: [randomInt]});
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
