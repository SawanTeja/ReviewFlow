const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('../swagger/config');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
