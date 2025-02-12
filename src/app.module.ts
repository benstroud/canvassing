import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'canvassing_dev',
      password: process.env.POSTGRES_PASSWORD || 'canvassing_dev',
      database: process.env.POSTGRES_DB || 'canvassing_dev',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // For development only; use migrations in production
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
