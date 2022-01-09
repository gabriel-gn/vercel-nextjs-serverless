import { Module } from "@nestjs/common";
import { DecksService } from "./decks.service";
import { DecksController } from "./decks.controller";
import { HttpDecksService } from "./http-decks.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    DecksController
  ],
  providers: [
    DecksService,
    HttpDecksService
  ]
})
export class DecksModule {
}
