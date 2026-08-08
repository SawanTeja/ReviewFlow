const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('../swagger/config');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
