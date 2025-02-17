// Description: The entry point of the application.

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BEARER_AUTH_NAME } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Canvassing API')
    .setDescription('Canvassing API for demo purposes')
    .setVersion('1.0')
    .addTag('canvassing')
    .addBearerAuth(
      {
        description: `Enter only the JWT token`,
        name: 'Authorization',
        bearerFormat: 'Bearer JWT',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      BEARER_AUTH_NAME,
    )
    .build();

  // OpenAPI (Swagger) sandbox
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // TODO review CORS configuration before production use.
  app.enableCors();

  //await CommandFactory.run(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
