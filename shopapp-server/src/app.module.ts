import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleControllerModule } from './controllers/example-controller/example-controller.module';
import { ExampleControllerController } from './example-controller/example-controller.controller';
import { ExampleControllerModule } from './controllers/example-controller/example-controller.module';

@Module({
  imports: [ExampleControllerModule],
  controllers: [AppController, ExampleControllerController],
  providers: [AppService],
})
export class AppModule {}
