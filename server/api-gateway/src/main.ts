import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import morgan from 'morgan';
import { AppLogger } from '@shared/logger/AppLogger';

AppLogger.init('api-gateway');

async function bootstrap() {
  const PORT = process.env.PORT || 3001;
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Morgan logging
  app.use(morgan('dev'));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('WMS Platform API')
    .setDescription(
      `
      ## Warehouse Management System - Microservices API
      
      ### Authentication
      Most endpoints require JWT Bearer token. Get one via \`/api/auth/login\`
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer(`http://localhost:${PORT}`, 'Local Development')
    .addServer(`http://localhost:${PORT}/api`, 'API Gateway')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Inventory', 'Inventory management endpoints')
    .addTag('Orders', 'Order processing endpoints')
    .setExternalDoc('Postman Collection', '/api/docs-json')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keeps token between page refreshes
      docExpansion: 'list', // Collapse sections by default
      filter: true, // Enable search/filter
      showRequestDuration: true, // Show request timing
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
    customSiteTitle: 'WMS API Documentation',
    customCss: '.swagger-ui .topbar { display: none }', // Hide Swagger top bar
    customfavIcon: 'https://nestjs.com/img/favicon.png',
  });

  // Also expose raw JSON for Postman import
  app.getHttpAdapter().get('/api/docs-json', (req, res) => {
    res.json(document);
  });

  await app.listen(PORT ?? 3001);
  console.log(`API Gateway is running on: http://localhost:${PORT}`);
  console.log(` Swagger docs available at: http://localhost:${PORT}/api/docs`);
  console.log(
    `Swagger JSON available at: http://localhost:${PORT}/api/docs-json`,
  );
}

bootstrap();
