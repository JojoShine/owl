const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '一卡通平台 第三方API文档',
      version: '1.0.0',
      description: '一卡通平台第三方接口集成文档，提供给外部系统集成使用',
      contact: {
        name: '平台技术团队',
        email: 'tech@example.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? '生产环境' : '开发环境'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'api_key',
          description: 'API密钥标识'
        },
        SignatureAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'HMAC-SHA256',
          description: 'HMAC-SHA256签名验证'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            code: {
              type: 'integer'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'null'
            }
          }
        }
      }
    }
  },
  // 仅扫描 business 模块下的路由文件
  apis: [
    path.join(__dirname, '../modules/business/**/*.routes.js')
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
