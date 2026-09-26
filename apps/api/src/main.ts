import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { readRuntimeEnvironment } from './config/environment';

async function bootstrap() {
  const environment = readRuntimeEnvironment();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (environment.trustProxyHops > 0) {
    app.set('trust proxy', environment.trustProxyHops);
  }
  app.set('query parser', 'simple');
  app.disable('x-powered-by');
  app.use(
    helmet({
      strictTransportSecurity: environment.isProduction ? undefined : false,
    }),
  );
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Pragma', 'no-cache');
    next();
  });
  app.enableCors({
    origin: environment.isProduction
      ? [environment.frontendOrigin]
      : [environment.frontendOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type'],
  });

  const rateLimitMessage = {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Too many requests. Please try again later.',
  };
  const burstLimiter = rateLimit({
    windowMs: 1_000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: rateLimitMessage,
  });
  const sustainedLimiter = rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: rateLimitMessage,
  });
  const expensiveRouteLimiter = rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: rateLimitMessage,
  });

  app.use('/api', burstLimiter, sustainedLimiter);
  app.use('/api', (request: Request, response: Response, next: NextFunction) => {
    const isExpensiveRoute =
      request.method === 'GET' &&
      (request.path === '/trends' || /^\/works\/W\d{1,20}\/graph$/.test(request.path));
    if (!isExpensiveRoute) return next();
    return expensiveRouteLimiter(request, response, next);
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableShutdownHooks();
  await app.listen(environment.port, environment.host);
  console.log(`ResearchTrail API running at http://${environment.host}:${environment.port}/api`);
}

void bootstrap();
