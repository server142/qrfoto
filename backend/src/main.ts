import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitar CORS para que Next.js pueda comunicarse
  app.enableCors();
  // Listen on 0.0.0.0 to allow access from local network (mobile phones)
  await app.listen(process.env.PORT || 3001, '0.0.0.0');
  console.log(`Backend running on http://localhost:3001 and the local network`);
}
bootstrap();
