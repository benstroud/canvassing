// Purpose: Entry point for the management commands.

import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
