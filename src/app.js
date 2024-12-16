const express = require('express');
const cookieParser = require('cookie-parser');
const { passport } = require('./api/middlewares/auth');
const bodyParser = require('body-parser');
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./config/swagger');
const routes = require('./api/routes');
const cors = require('cors');

const app = express();
const PORT = 3000;

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec,swaggerUiOptions));

// CORS 설정
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://172.23.96.1:5500','null'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],  // OPTIONS 메서드 추가
  allowedHeaders: [
      'Content-Type', 
      'X-CSRF-Token', 
      'Authorization', 
      'CSRF-Token', 
      'x-csrf-token'
  ],
  exposedHeaders: ['X-CSRF-Token', 'CSRF-Token'],  // CSRF 토큰 헤더 노출 설정 추가
}));

// router
app.use('/', routes);

// run server
app.listen(PORT, async () => {
  try {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
});

module.exports = app;