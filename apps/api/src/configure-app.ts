import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ApiExceptionFilter } from './common/api-exception.filter';

export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({ origin: true, credentials: true });
}
