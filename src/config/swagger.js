const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'User Management API', 
      version: '1.0.0' 
    },
    servers: [{ 
      url: 'http://localhost:3000' 
    }],
    components: {
      securitySchemes: {
        bearerAuth: { 
          type: 'http', 
          scheme: 'bearer', 
          bearerFormat: 'JWT' 
        },
        csrfToken: {
          type: 'apiKey',
          name: 'CSRF-Token',
          in: 'header',
          description: 'CSRF 토큰'
        }
      }
    },
    security: [
      { 
        bearerAuth: [],
        csrfToken: [] 
      }
    ]
  },
  apis: ['./config/userSwagger.yaml', './config/noteSwagger.yaml']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    authAction: {
      JWT: {
        name: 'JWT',
        schema: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Bearer '
        }
      }
    }
  }
};

module.exports = { swaggerUi, swaggerSpec, swaggerUiOptions };
