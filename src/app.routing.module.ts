import { Module } from "@nestjs/common";
import { DecksModule } from "./controllers/decks/decks.module";
import { RouterModule } from "@nestjs/core";

@Module({
  imports: [
    DecksModule,
    RouterModule.register([
      {
        path: "decks",
        module: DecksModule
      }
    ])
  ]
})
export class AppRoutingModule {
}
