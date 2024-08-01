const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
  console.log(req.params)
  if (req.params.err === 'raise') {
    throw new Error('Raise test exception');
  }
  res.send({'airlines': AIRLINES});
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
  console.log(req.params)
  if (req.params.err === 'raise') {
    throw new Error('Raise test exception');
  }
  res.send({[req.params.airline]: []});
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
