import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
/* import { AppController } from './app.controller';
import { AppService } from './app.service'; */
// import { DATA_SOURCE } from './constants';
import { DatabaseModule } from './database.module';

import { entityRepositoriesProviders } from './app.providers';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    //TypeOrmModule.forRoot({ name: DATA_SOURCE })
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [...entityRepositoriesProviders, AppService],
})
export class AppModule {}
