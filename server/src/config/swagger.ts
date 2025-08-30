import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI & Storage Proxy API',
      version: '1.0.0',
      description: 'Express server providing secure proxy endpoints for OpenRouter AI and Bunny Storage',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'AI',
        description: 'OpenRouter AI proxy endpoints'
      },
      {
        name: 'Storage',
        description: 'Bunny Storage proxy endpoints'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase JWT token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        ChatMessage: {
          type: 'object',
          required: ['role', 'content'],
          properties: {
            role: {
              type: 'string',
              enum: ['system', 'user', 'assistant'],
              description: 'Message role'
            },
            content: {
              type: 'string',
              description: 'Message content'
            }
          }
        },
        ChatRequest: {
          type: 'object',
          required: ['model', 'messages'],
          properties: {
            model: {
              type: 'string',
              description: 'Model identifier',
              example: 'gpt-4'
            },
            messages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ChatMessage'
              }
            },
            stream: {
              type: 'boolean',
              description: 'Enable streaming response',
              default: false
            },
            temperature: {
              type: 'number',
              minimum: 0,
              maximum: 2,
              description: 'Sampling temperature'
            },
            max_tokens: {
              type: 'integer',
              description: 'Maximum tokens to generate'
            },
            top_p: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Top-p sampling'
            },
            frequency_penalty: {
              type: 'number',
              minimum: -2,
              maximum: 2,
              description: 'Frequency penalty'
            },
            presence_penalty: {
              type: 'number',
              minimum: -2,
              maximum: 2,
              description: 'Presence penalty'
            }
          }
        },
        UploadResponse: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'CDN URL of uploaded file'
            },
            path: {
              type: 'string',
              description: 'Storage path'
            },
            size: {
              type: 'integer',
              description: 'File size in bytes'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded'],
              description: 'Service status'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            uptime: {
              type: 'number',
              description: 'Process uptime in seconds'
            },
            environment: {
              type: 'string',
              description: 'Environment name'
            },
            version: {
              type: 'string',
              description: 'API version'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js']
}

export const swaggerSpec = swaggerJsdoc(options)