import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppRoutingModule } from "./app.routing.module";

@Module({
  imports: [
    AppRoutingModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
